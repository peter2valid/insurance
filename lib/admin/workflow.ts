import { brand } from "@/lib/brand";
import { admin, flow, statusLabels } from "@/lib/copy";
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
