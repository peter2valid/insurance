import { getRepo } from "@/lib/data/repo";
import type { Application, Client, Product } from "@/lib/data/types";
import { insurerByName } from "@/lib/data/insurers";
import { canAccess, clearPendingQuote, getPendingQuote, getReferral, getSession, type ClientSession } from "@/lib/session";
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
  const session = await getSession();
  if (!session) return { kind: "signed_out" };

  // Look up the client and the application together (one wait, not two).
  const [client, byRef] = await Promise.all([repo.getClient(session.c), ref ? repo.getApplication(ref) : null]);
  if (!client) return { kind: "signed_out" };

  let app: Application | null = null;
  if (ref) {
    app = byRef;
    // Only on the device that started it, or opened from our signed link.
    if (!app || !canAccess(session, app)) return { kind: "not_yours" };
  } else {
    app = await findOrCreateDraft(session, product);
  }

  if (app.submittedAt) return { kind: "submitted", client, app };
  return { kind: "active", client, app, resume: nextScreen(app, client) };
}

/**
 * A returning client carries on with their unfinished application — for the
 * product they picked, if they picked one; otherwise their latest draft.
 */
export async function findOrCreateDraft(session: ClientSession, product?: Product): Promise<Application> {
  const repo = getRepo();
  const clientId = session.c;
  const apps = await repo.listApplicationsForClient(clientId);
  // Only drafts this device may open: someone typing another person's number starts fresh.
  const draft = apps
    .filter((app) => !app.submittedAt && canAccess(session, app) && (!product || app.product === product))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];
  if (draft) return draft;
  // Came through an agent's link? Credit them (active agents only).
  const code = await getReferral();
  const agent = code ? await repo.findAgentByCode(code) : null;
  return repo.createApplication({
    clientId,
    product: product ?? "motor",
    agentId: agent?.status === "active" ? agent.id : undefined,
    details: { deviceId: session.d },
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
export async function applyQuote(session: ClientSession, raw: Record<string, string>): Promise<Application | null> {
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  if (!parsed.ok || !insurerByName(raw.insurer ?? "")) return null;
  const draft = await findOrCreateDraft(session, "motor");
  return getRepo().saveProgress(draft.ref, { step: draft.step, details: { ...parsed.details, insurer: raw.insurer } });
}

/** After sign-in: apply the quote chosen while signed out, if any. */
export async function applyPendingQuote(session: ClientSession): Promise<Application | null> {
  const pending = await getPendingQuote();
  if (!pending) return null;
  await clearPendingQuote();
  return applyQuote(session, pending);
}
