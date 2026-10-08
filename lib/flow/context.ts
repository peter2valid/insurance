import { getRepo } from "@/lib/data/repo";
import type { Application, Client, Product } from "@/lib/data/types";
import { insurerByName } from "@/lib/data/insurers";
import { clearPendingQuote, getPendingQuote, getReferral, getSessionClientId } from "@/lib/session";
import { parseMotorQuote } from "./motor-quote";
import { completedStep, nextScreen, type Screen } from "./screens";

/**
 * Server-side: who is signed in, and which application they're working on.
 * Used by flow pages, actions and the upload route so the same rules apply
 * everywhere.
 */

export type FlowContext =
  | { kind: "signed_out" }
  | { kind: "not_yours" }
  | { kind: "submitted"; client: Client; app: Application }
  | { kind: "active"; client: Client; app: Application; resume: Screen };

export async function getFlowContext(ref?: string | null, product?: Product): Promise<FlowContext> {
  const repo = getRepo();
  const clientId = await getSessionClientId();
  if (!clientId) return { kind: "signed_out" };

  // Look up the client and the application together (one wait, not two).
  const [client, byRef] = await Promise.all([repo.getClient(clientId), ref ? repo.getApplication(ref) : null]);
  if (!client) return { kind: "signed_out" };

  let app: Application | null = null;
  if (ref) {
    app = byRef;
    if (!app || app.clientId !== client.id) return { kind: "not_yours" };
  } else {
    app = await findOrCreateDraft(client.id, product);
  }

  if (app.submittedAt) return { kind: "submitted", client, app };
  return { kind: "active", client, app, resume: nextScreen(app, client) };
}

/**
 * A returning client carries on with their unfinished application — for the
 * product they picked, if they picked one; otherwise their latest draft.
 */
export async function findOrCreateDraft(clientId: string, product?: Product): Promise<Application> {
  const repo = getRepo();
  const apps = await repo.listApplicationsForClient(clientId);
  const draft = apps
    .filter((app) => !app.submittedAt && (!product || app.product === product))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  if (draft) return draft;
  // Came through an agent's link? Credit them (active agents only).
  const code = await getReferral();
  const agent = code ? await repo.findAgentByCode(code) : null;
  return repo.createApplication({
    clientId,
    product: product ?? "motor",
    agentId: agent?.status === "active" ? agent.id : undefined,
  });
}

/**
 * Save answers, then work out where the client goes next. Also records the
 * last completed step, which drives stall detection on the admin board.
 */
export async function saveAndAdvance(
  app: Application,
  client: Client,
  details: Record<string, string>,
): Promise<{ app: Application; next: Screen }> {
  const repo = getRepo();
  const merged = { ...app, details: { ...app.details, ...details } };
  const next = nextScreen(merged, client);
  const saved = await repo.saveProgress(app.ref, { step: completedStep(next), details });
  return { app: saved, next };
}

/**
 * Turn a chosen quote (answers + insurer) into the client's motor
 * application, so the flow skips everything already answered. Returns null
 * when the quote no longer checks out. Server Actions only (sets cookies).
 */
export async function applyQuote(clientId: string, raw: Record<string, string>): Promise<Application | null> {
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  if (!parsed.ok || !insurerByName(raw.insurer ?? "")) return null;
  const draft = await findOrCreateDraft(clientId, "motor");
  return getRepo().saveProgress(draft.ref, { step: draft.step, details: { ...parsed.details, insurer: raw.insurer } });
}

/** After sign-in: apply the quote chosen while signed out, if any. */
export async function applyPendingQuote(clientId: string): Promise<Application | null> {
  const pending = await getPendingQuote();
  if (!pending) return null;
  await clearPendingQuote();
  return applyQuote(clientId, pending);
}
