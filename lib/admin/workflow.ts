import { brand } from "@/lib/brand";
import { admin, flow, statusLabels } from "@/lib/copy";
import { getQuoteProvider } from "@/lib/data/quote-provider";
import { getRepo } from "@/lib/data/repo";
import type { Application, ApplicationStatus, Client, Quote } from "@/lib/data/types";
import { getNotifier, renderTemplate, type TemplateData, type TemplateName } from "@/lib/notify";

/**
 * The broker's one-click actions (CLAUDE.md §8.3). Each one changes the
 * data, logs the message on the application, and sends the pre-written
 * notification (simulated) — together, so nothing is forgotten.
 * The client's status page updates at once via the event bus.
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

const firstName = (client: Client) => client.name.split(" ")[0] || client.name;
const statusLink = (ref: string) => `${brand.siteUrl}/my/${ref}`;

/** Send a WhatsApp to the client (simulated) and keep a copy in the message log. */
async function messageClient<T extends TemplateName>(app: Application, client: Client, template: T, data: TemplateData<T>) {
  await getNotifier().send({
    channel: "whatsapp",
    to: client.phone,
    audience: "client",
    template,
    data,
    applicationRef: app.ref,
  });
  await getRepo().addMessage({
    applicationRef: app.ref,
    direction: "out",
    channel: "whatsapp",
    body: renderTemplate(template, data),
  });
}

async function setStatusAndTell(app: Application, client: Client, status: ApplicationStatus) {
  const updated = await getRepo().setStatus(app.ref, status);
  await messageClient(updated, client, "status_changed", {
    firstName: firstName(client),
    ref: app.ref,
    statusLabel: statusLabels[status],
    link: statusLink(app.ref),
  });
  return updated;
}

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
  if (app.status !== "needs_info") await repo.setStatus(ref, "needs_info");
  await messageClient(app, client, "document_requested", {
    firstName: firstName(client),
    ref,
    document: flow.documentsInline[doc.type],
    reason,
    link: statusLink(ref),
  });
}

export async function addQuote(
  ref: string,
  input: Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">,
): Promise<void> {
  const { app } = await load(ref);
  if (!["documents_checked", "preparing_quotes"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  const repo = getRepo();
  await repo.addQuote(ref, input);
  if (app.status === "documents_checked") await repo.setStatus(ref, "preparing_quotes");
}

export async function markQuotesReady(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (!["documents_checked", "preparing_quotes"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  const quotes = await getRepo().listQuotes(ref);
  if (quotes.length === 0) throw new WorkflowError(admin.errors.noQuotes);
  await setStatusAndTell(app, client, "quotes_ready");
}

export async function markCovered(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (app.status !== "cover_chosen") throw new WorkflowError(admin.errors.notAllowed);
  await setStatusAndTell(app, client, "covered");
}

/** Pre-written WhatsApp nudge for a client who has gone quiet. */
export async function nudge(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (app.status === "covered") throw new WorkflowError(admin.errors.notAllowed);
  const link = app.submittedAt
    ? statusLink(ref)
    : `${brand.siteUrl}/start/resume?ref=${encodeURIComponent(ref)}`;
  await messageClient(app, client, "nudge", { firstName: firstName(client) || "there", link });
}

/** Benefits shown on one-click quotes, per product (fixture wording). */
const SUGGESTED_BENEFITS: Record<Application["product"], string[][]> = {
  motor: [
    ["Windscreen cover", "Towing up to KES 30,000", "Courtesy car for 10 days"],
    ["Windscreen cover", "Political violence and terrorism cover"],
    ["Windscreen cover", "Towing up to KES 20,000", "Radio and entertainment system"],
  ],
  health: [
    ["Outpatient from day one", "Day-care procedures", "Ambulance cover"],
    ["Chronic conditions after 12 months", "Optical and dental add-on"],
    ["Wide hospital network", "Last expense cover"],
  ],
  travel: [
    ["Emergency medical up to USD 50,000", "Lost luggage", "Trip cancellation"],
    ["Emergency medical up to USD 100,000", "Flight delay", "Schengen visa letter"],
    ["Emergency medical up to USD 30,000", "Lost passport help"],
  ],
  business: [
    ["Fire and burglary", "Public liability up to KES 1,000,000"],
    ["Fire, burglary and floods", "Money in transit"],
    ["Fire and burglary", "Staff injuries (WIBA)", "Business interruption"],
  ],
};

/**
 * One click: prepare three quotes from the QuoteProvider (fixture prices,
 * placeholder insurers) and send them to the client. Replaces adding each
 * quote by hand — the "Add quote" form is still there for custom quotes.
 */
export async function sendSuggestedQuotes(ref: string): Promise<void> {
  const { app, client } = await load(ref);
  if (!["documents_checked", "preparing_quotes"].includes(app.status)) {
    throw new WorkflowError(admin.errors.notAllowed);
  }
  const repo = getRepo();
  const existing = await repo.listQuotes(ref);
  if (existing.length === 0) {
    const suggestions = await getQuoteProvider().suggest(app);
    const benefits = SUGGESTED_BENEFITS[app.product];
    for (const [i, quote] of suggestions.entries()) {
      await repo.addQuote(ref, { ...quote, benefits: benefits[i] ?? [] });
    }
  }
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

/** The pre-written nudge text, so the admin can also send it from their own WhatsApp. */
export function nudgeText(app: Application, client: Client): string {
  const link = app.submittedAt
    ? statusLink(app.ref)
    : `${brand.siteUrl}/start/resume?ref=${encodeURIComponent(app.ref)}`;
  return renderTemplate("nudge", { firstName: firstName(client) || "there", link });
}
