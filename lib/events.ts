import { getSupabase } from "@/lib/data/supabase-client";

/**
 * Change tracking for live sync. Open pages poll `currentVersion()` (via
 * /api/version) every few seconds and refresh when it moves — this works on
 * Vercel's serverless functions, where a long-lived stream wouldn't.
 *
 * - Supabase: the version is the latest row id in the `changes` table.
 * - Local mock: an in-process counter bumped by `publish()`.
 */

export type AppEvent =
  | { type: "application.created"; ref: string }
  | { type: "application.updated"; ref: string }
  | { type: "application.submitted"; ref: string }
  | { type: "message.added"; ref: string }
  | { type: "quote.added"; ref: string }
  | { type: "outbox.sent"; id: string; ref?: string }
  | { type: "demo.reset" };

type Listener = (event: AppEvent) => void;

// Kept on globalThis so dev hot-reload doesn't drop subscribers.
const globalBus = globalThis as unknown as { __beaconListeners?: Set<Listener> };
const listeners = (globalBus.__beaconListeners ??= new Set<Listener>());

// In-memory versions for the mock (global + per application).
const globalVersions = globalThis as unknown as { __beaconVersions?: { all: number; byRef: Map<string, number> } };
const versions = (globalVersions.__beaconVersions ??= { all: 0, byRef: new Map() });

export function publish(event: AppEvent): void {
  versions.all += 1;
  if ("ref" in event && event.ref) versions.byRef.set(event.ref, versions.all);
  if (event.type === "demo.reset") versions.byRef.clear();
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A broken subscriber must never break a write.
    }
  }
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The current version for one application (client status page) or for
 * everything (admin). Includes "everything" changes such as a demo reset.
 */
export async function currentVersion(ref?: string | null): Promise<string> {
  const db = getSupabase();
  if (db) {
    let query = db.from("changes").select("id").order("id", { ascending: false }).limit(1);
    if (ref) query = query.or(`ref.eq.${ref},ref.is.null`);
    const { data } = await query;
    return String(data?.[0]?.id ?? 0);
  }
  return String(ref ? (versions.byRef.get(ref) ?? 0) : versions.all);
}
