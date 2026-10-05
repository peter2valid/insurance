import { brand } from "@/lib/brand";
import { admin, coverLabels, flow, productNamesInline, statusMessages } from "@/lib/copy";
import { periodOf } from "@/lib/data/motor";
import { getQuoteProvider } from "@/lib/data/quote-provider";
import { getRepo } from "@/lib/data/repo";
import type { Agent, Application, ApplicationStatus, Client, Payment, Policy, Quote } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { getNotifier, renderTemplate, type Delivery, type TemplateData, type TemplateName } from "@/lib/notify";
import { getPaymentProvider, simulatedReceipt } from "@/lib/payments";

/**
 * Everything that moves an application forward, in one place: the
 * broker's one-click actions (CLAUDE.md §8.3) and the client's own steps
 * (choose, pay, renew). Each one changes the data, tells the right people
 * (WhatsApp + email, simulated unless a provider is set up) and logs the
 * message — together, so nothing is forgotten. Pages update at once.
 *
 * Server-only. Throws WorkflowError for actions that don't fit the stage.
 */

export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

async function load(ref: string): Promise<{ app: Application; client: Client }> {
  const repo = getRepo();
  const app = await repo.getApplication(ref);
  if (!app) throw new WorkflowError(admin.errors.generic);
  const client = await repo.getClient(app.clientId);
  if (!client) throw new WorkflowError(admin.errors.generic);
  return { app, client };
}

const firstName = (name: string) => name.split(" ")[0] || name || "there";
const statusLink = (ref: string) => `${brand.siteUrl}/my/${ref}`;
export const agentPortalLink = () => `${brand.siteUrl}/agent`;
export const referralLink = (code: string) => `${brand.siteUrl}/r/${code}`;

/** WhatsApp the client (and email them if we have their address), and keep a copy in the message log. */
async function tellClient<T extends TemplateName>(
  app: Application,
  client: Client,
  template: T,
  data: TemplateData<T>,
): Promise<Delivery> {
  const notifier = getNotifier();
  const [whatsapp] = await Promise.all([
    notifier.send({ channel: "whatsapp", to: client.phone, audience: "client", template, data, applicationRef: app.ref }),
    client.email
      ? notifier.send({ channel: "email", to: client.email, audience: "client", template, data, applicationRef: app.ref })
      : null,
    getRepo().addMessage({ applicationRef: app.ref, direction: "out", channel: "whatsapp", body: renderTemplate(template, data) }),
  ]);
  return whatsapp.delivery;
}

/** Alert the broker on WhatsApp and email. */
export async function tellAdmin<T extends TemplateName>(template: T, data: TemplateData<T>, ref?: string): Promise<void> {
  const notifier = getNotifier();
  await Promise.all([
    notifier.send({ channel: "whatsapp", to: "admin", audience: "admin", template, data, applicationRef: ref }),
    notifier.send({ channel: "email", to: "admin", audience: "admin", template, data, applicationRef: ref }),
  ]);
}

async function tellAgent<T extends TemplateName>(agent: Agent, template: T, data: TemplateData<T>, ref?: string) {
  const notifier = getNotifier();
  await Promise.all([
    notifier.send({ channel: "whatsapp", to: agent.phone, audience: "agent", template, data, applicationRef: ref }),
    agent.email ? notifier.send({ channel: "email", to: agent.email, audience: "agent", template, data, applicationRef: ref }) : null,
  ]);
}

async function setStatusAndTell(app: Application, client: Client, status: ApplicationStatus) {
  const updated = await getRepo().setStatus(app.ref, status);
  const message = statusMessages[status];
  await tellClient(updated, client, "status_changed", {
    firstName: firstName(client.name),
    ref: app.ref,
    detail: message.detail,
    linkLabel: message.linkLabel,
    link: `${statusLink(app.ref)}${message.anchor}`,
  });
  return updated;
}

/** Statuses before any quote has gone out. */
const BEFORE_QUOTES: ApplicationStatus[] = ["received", "documents_checked", "preparing_quotes", "needs_info"];

// ---------------------------------------------------------------------------
// Client steps
// ---------------------------------------------------------------------------

/**
 * The client pressed "Send application". Tell the broker at once; with
 * auto-quote on, price every insurer and show the quotes straight away.
 */
export async function applicationSubmitted(ref: string): Promise<{ autoQuoted: boolean }> {
  const { app, client } = await load(ref);
  const { summarize } = await import("@/lib/products/summary");
  await tellAdmin(
    "application_submitted",
    { ref, clientName: client.name, product: productNamesInline[app.product], summary: summarize(app) },
    ref,
  );

  const settings = await getRepo().getSettings();
  if (settings.autoQuote) {
    await createQuotes(app);
    await setStatusAndTell(app, client, "quotes_ready");
    return { autoQuoted: true };
  }
  const message = statusMessages.received;
  await tellClient(app, client, "status_changed", {
    firstName: firstName(client.name),
    ref,
    detail: message.detail,
    linkLabel: message.linkLabel,
    link: statusLink(ref),
  });
  return { autoQuoted: false };
}

async function createQuotes(app: Application): Promise<Quote[]> {
  const repo = getRepo();
  const existing = await repo.listQuotes(app.ref);
  if (existing.length > 0) return existing;
  const drafts = await getQuoteProvider().suggest(app);
  const quotes: Quote[] = [];
  for (const draft of drafts) quotes.push(await repo.addQuote(app.ref, draft));
  return quotes;
}

/** The client picked a quote: ask them to pay, and tell the broker. */
export async function clientChoseQuote(ref: string, quoteId: string): Promise<Quote> {
  const { app, client } = await load(ref);
  if (app.status !== "quotes_ready") throw new WorkflowError(admin.errors.notAllowed);
  const quote = await getRepo().chooseQuote(ref, quoteId);
  await tellAdmin("cover_chosen", { ref, clientName: client.name, insurer: quote.insurer, premium: formatKes(quote.premiumKes) }, ref);
  const message = statusMessages.cover_chosen;
  await tellClient(app, client, "status_changed", {
    firstName: firstName(client.name),
    ref,
    detail: message.detail,
    linkLabel: message.linkLabel,
    link: `${statusLink(ref)}${message.anchor}`,
  });
  return quote;
}

export async function chosenQuote(ref: string): Promise<Quote | undefined> {
  return (await getRepo().listQuotes(ref)).find((quote) => quote.chosen);
}

/** Send an M-Pesa payment request for the chosen cover. */
export async function requestPayment(ref: string, phone: string): Promise<Payment> {
  const { app } = await load(ref);
  if (app.status !== "cover_chosen") throw new WorkflowError(admin.errors.notAllowed);
  const quote = await chosenQuote(ref);
  if (!quote) throw new WorkflowError(admin.errors.notAllowed);
  return getPaymentProvider().requestPayment({ ref, phone, amountKes: quote.premiumKes });
}

/**
 * A payment arrived (M-Pesa callback — or the demo button, or the broker
 * recording a cash/bank payment). Moves the application to "paid", earns
 * the agent their commission and tells everyone.
 */
export async function confirmPayment(paymentId: string, receipt: string = simulatedReceipt()): Promise<void> {
  const repo = getRepo();
  const payment = (await repo.listPayments()).find((item) => item.id === paymentId);
  if (!payment) throw new WorkflowError(admin.errors.generic);
  if (payment.status === "paid") return;
  const { app, client } = await load(payment.applicationRef);
  if (app.status !== "cover_chosen") throw new WorkflowError(admin.errors.notAllowed);

  const paid = await repo.updatePayment(paymentId, { status: "paid", receipt, paidAt: new Date().toISOString() });
  await repo.setStatus(app.ref, "paid");
  const quote = await chosenQuote(app.ref);
  const amount = formatKes(paid.amountKes);

  await Promise.all([
    tellAdmin(
      "payment_received_admin",
      { ref: app.ref, clientName: client.name, amount, receipt, insurer: quote?.insurer ?? "" },
      app.ref,
    ),
    tellClient(app, client, "payment_receipt", {
      firstName: firstName(client.name),
      ref: app.ref,
      amount,
      receipt,
      link: statusLink(app.ref),
    }),
  ]);

  if (app.agentId && quote) await earnCommission(app, client, quote);
}

async function earnCommission(app: Application, client: Client, quote: Quote) {
  const repo = getRepo();
  const agent = await repo.getAgent(app.agentId!);
  if (!agent || agent.status !== "active") return;
  if ((await repo.listCommissions(agent.id)).some((item) => item.applicationRef === app.ref)) return;
  const basic = quote.breakdown?.basicKes ?? quote.premiumKes;
  const amountKes = Math.round((basic * agent.commissionRate) / 100);
  await repo.createCommission({ agentId: agent.id, applicationRef: app.ref, premiumKes: basic, rate: agent.commissionRate, amountKes });
  await tellAgent(
    agent,
    "agent_commission",
    { firstName: firstName(agent.name), amount: formatKes(amountKes), clientName: client.name, ref: app.ref, portal: agentPortalLink() },
    app.ref,
  );
}

/**
 * "Renew now": a new application with last year's answers and checked
 * documents, sent straight away — the client just chooses and pays.
 */
export async function startRenewal(ref: string): Promise<string> {
  const { app } = await load(ref);
  if (app.status !== "covered") throw new WorkflowError(admin.errors.notAllowed);
  const repo = getRepo();
  const existing = (await repo.listApplicationsForClient(app.clientId)).find(
    (item) => item.details.renewalOf === ref && item.status !== "covered",
  );
  if (existing) return existing.ref;

  const renewal = await repo.createApplication({
    clientId: app.clientId,
    product: app.product,
    agentId: app.agentId,
    details: { ...app.details, renewalOf: ref },
  });
  for (const doc of app.documents) {
    const match = renewal.documents.find((item) => item.type === doc.type);
    if (match && doc.status === "verified") {
      await repo.updateDocument(renewal.ref, match.id, {
        status: "verified",
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      });
    }
  }
  await repo.saveProgress(renewal.ref, { step: 5 });
  await repo.submitApplication(renewal.ref);
  await applicationSubmitted(renewal.ref);
  return renewal.ref;
}

// ---------------------------------------------------------------------------
// Broker actions
// ---------------------------------------------------------------------------

/** Mark one document verified. When every required document is verified, move on. */
export async function verifyDocument(ref: string, documentId: string): Promise<{ allVerified: boolean }> {
  const { app, client } = await load(ref);
  const doc = app.documents.find((item) => item.id === documentId);
  if (!doc || doc.status !== "uploaded") throw new WorkflowError(admin.errors.notAllowed);

  const updated = await getRepo().updateDocument(ref, documentId, { status: "verified" });
  const allVerified = updated.documents.filter((item) => item.required).every((item) => item.status === "verified");

  if (allVerified && (updated.status === "received" || updated.status === "needs_info")) {
    await setStatusAndTell(updated, client, "documents_checked");
  }
  return { allVerified };
}

/** Reject a document with a plain reason; the client is asked to upload again. */
export async function requestReupload(ref: string, documentId: string, reason: string): Promise<void> {
  const { app, client } = await load(ref);
  const doc = app.documents.find((item) => item.id === documentId);
  if (!doc || doc.status === "needed") throw new WorkflowError(admin.errors.notAllowed);

  const repo = getRepo();
  await repo.updateDocument(ref, documentId, { status: "rejected", rejectionReason: reason });
  // Before quotes, the application waits for the document. After quotes
  // it carries on — the cover just isn't issued until it's fixed.
  if (BEFORE_QUOTES.includes(app.status) && app.status !== "needs_info") await repo.setStatus(ref, "needs_info");
  await tellClient(app, client, "document_requested", {
    firstName: firstName(client.name),
    ref,
    document: flow.documentsInline[doc.type],
    reason,
    link: `${statusLink(ref)}?upload=${doc.type}`,
  });
}

export async function addQuote(ref: string, input: Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">): Promise<void> {
  const { app } = await load(ref);
  if (!["documents_checked", "preparing_quotes", "received"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  const repo = getRepo();
  await repo.addQuote(ref, input);
  if (app.status !== "preparing_quotes") await repo.setStatus(ref, "preparing_quotes");
}

export async function markQuotesReady(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (!["documents_checked", "preparing_quotes", "received"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  const quotes = await getRepo().listQuotes(ref);
  if (quotes.length === 0) throw new WorkflowError(admin.errors.noQuotes);
  await setStatusAndTell(app, client, "quotes_ready");
}

/** One click: price every insurer on the panel and send the quotes. */
export async function sendSuggestedQuotes(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (!["documents_checked", "preparing_quotes", "received"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  await createQuotes(app);
  await setStatusAndTell(app, client, "quotes_ready");
}

/** One click: verify every document that's waiting to be checked. */
export async function verifyAllDocuments(ref: string): Promise<{ allVerified: boolean }> {
  const { app } = await load(ref);
  const waiting = app.documents.filter((doc) => doc.status === "uploaded");
  if (waiting.length === 0) throw new WorkflowError(admin.errors.notAllowed);
  let allVerified = false;
  for (const doc of waiting) {
    ({ allVerified } = await verifyDocument(ref, doc.id));
  }
  return { allVerified };
}

/** The client paid in cash, by bank or straight to the paybill: record it. */
export async function recordPayment(ref: string, receipt: string): Promise<void> {
  const { app, client } = await load(ref);
  if (app.status !== "cover_chosen") throw new WorkflowError(admin.errors.notAllowed);
  const quote = await chosenQuote(ref);
  if (!quote) throw new WorkflowError(admin.errors.notAllowed);
  const pending = (await getRepo().listPayments(ref)).find((item) => item.status === "pending");
  const payment =
    pending ?? (await getRepo().createPayment({ applicationRef: ref, phone: client.phone, amountKes: quote.premiumKes, method: "mpesa" }));
  await confirmPayment(payment.id, receipt.trim() || simulatedReceipt());
}

/** Issue the cover: save the policy, tell the client, and schedule renewal reminders. */
export async function issueCover(
  ref: string,
  input: { policyNumber: string; certificateNumber?: string; startsOn: string },
): Promise<void> {
  const { app, client } = await load(ref);
  if (app.status !== "paid") throw new WorkflowError(admin.errors.notAllowed);
  if (app.documents.some((doc) => doc.required && doc.status !== "verified")) {
    throw new WorkflowError(admin.errors.verifyFirst);
  }
  const quote = await chosenQuote(ref);
  if (!quote) throw new WorkflowError(admin.errors.generic);

  const starts = new Date(`${input.startsOn}T00:00:00+03:00`);
  const ends = new Date(starts);
  if (periodOf(app.details) === "monthly" || quote.period === "monthly") ends.setMonth(ends.getMonth() + 1);
  else ends.setFullYear(ends.getFullYear() + 1);
  ends.setDate(ends.getDate() - 1);

  const policy: Policy = {
    insurer: quote.insurer,
    coverType: quote.coverType,
    premiumKes: quote.premiumKes,
    policyNumber: input.policyNumber.trim(),
    certificateNumber: input.certificateNumber?.trim() || undefined,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
  };
  const repo = getRepo();
  await repo.setPolicy(ref, policy);
  const updated = await repo.setStatus(ref, "covered");
  await tellClient(updated, client, "cover_issued", {
    firstName: firstName(client.name),
    ref,
    insurer: `${policy.insurer} ${coverLabels[policy.coverType] ?? ""}`.trim(),
    policyNumber: policy.policyNumber,
    endsOn: formatDate(policy.endsAt),
    link: statusLink(ref),
  });
}

/** Pre-written WhatsApp nudge for a client who has gone quiet. */
export async function nudge(ref: string): Promise<Delivery> {
  const { app, client } = await load(ref);
  if (app.status === "covered") throw new WorkflowError(admin.errors.notAllowed);
  return tellClient(app, client, "nudge", nudgeData(app, client, nudgeLink(app)));
}

function nudgeLink(app: Application): string {
  if (!app.submittedAt) return `${brand.siteUrl}/start/resume?ref=${encodeURIComponent(app.ref)}`;
  if (app.status === "quotes_ready") return `${statusLink(app.ref)}#quotes`;
  if (app.status === "cover_chosen") return `${statusLink(app.ref)}#payment`;
  return statusLink(app.ref);
}

/** The pre-written nudge text, so the admin can also send it from their own WhatsApp. */
export function nudgeText(app: Application, client: Client): string {
  return renderTemplate("nudge", nudgeData(app, client, nudgeLink(app)));
}

function nudgeData(app: Application, client: Client, link: string) {
  return {
    firstName: firstName(client.name),
    product: productNamesInline[app.product],
    ref: app.ref,
    submitted: Boolean(app.submittedAt),
    link,
  };
}

// Reminders used by the automations (lib/automation).

export async function remindQuotes(app: Application, client: Client): Promise<void> {
  const quotes = await getRepo().listQuotes(app.ref);
  const cheapest = Math.min(...quotes.map((quote) => quote.premiumKes));
  await tellClient(app, client, "quote_reminder", {
    firstName: firstName(client.name),
    ref: app.ref,
    cheapest: formatKes(Number.isFinite(cheapest) ? cheapest : 0),
    link: `${statusLink(app.ref)}#quotes`,
  });
}

export async function remindPayment(app: Application, client: Client): Promise<void> {
  const quote = await chosenQuote(app.ref);
  await tellClient(app, client, "payment_reminder", {
    firstName: firstName(client.name),
    ref: app.ref,
    amount: formatKes(quote?.premiumKes ?? 0),
    link: `${statusLink(app.ref)}#payment`,
  });
}

export async function remindRenewal(app: Application, client: Client, days: number): Promise<void> {
  if (!app.policy) return;
  await tellClient(app, client, "renewal_reminder", {
    firstName: firstName(client.name),
    days,
    insurer: app.policy.insurer,
    plate: app.details.plate ?? "",
    endsOn: formatDate(app.policy.endsAt),
    link: `${statusLink(app.ref)}?renew=1`,
  });
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export async function approveAgent(agentId: string): Promise<void> {
  const repo = getRepo();
  const agent = await repo.getAgent(agentId);
  if (!agent) throw new WorkflowError(admin.errors.generic);
  const updated = await repo.updateAgent(agentId, { status: "active" });
  await tellAgent(updated, "agent_welcome", {
    firstName: firstName(updated.name),
    code: updated.code,
    link: referralLink(updated.code),
    portal: agentPortalLink(),
  });
}

export async function setAgentStatus(agentId: string, status: Agent["status"]): Promise<void> {
  await getRepo().updateAgent(agentId, { status });
}

export async function setAgentRate(agentId: string, rate: number): Promise<void> {
  if (!Number.isFinite(rate) || rate < 0 || rate > 20) throw new WorkflowError(admin.agents.errors.rate);
  await getRepo().updateAgent(agentId, { commissionRate: Math.round(rate * 100) / 100 });
}

/** Pay out every commission owed to an agent (M-Pesa payout is SIMULATED). */
export async function payAgent(agentId: string): Promise<number> {
  const repo = getRepo();
  const agent = await repo.getAgent(agentId);
  if (!agent) throw new WorkflowError(admin.errors.generic);
  const owed = (await repo.listCommissions(agentId)).filter((item) => item.status !== "paid");
  if (owed.length === 0) throw new WorkflowError(admin.agents.errors.nothingOwed);
  const paidAt = new Date().toISOString();
  for (const item of owed) await repo.updateCommission(item.id, { status: "paid", paidAt });
  const total = owed.reduce((sum, item) => sum + item.amountKes, 0);
  await tellAgent(agent, "agent_paid", { firstName: firstName(agent.name), amount: formatKes(total), portal: agentPortalLink() });
  return total;
}
