/**
 * SIMULATED real-time channel. An in-process event bus that the mock repo
 * and the simulated notifier publish to; Stage 7 streams it to open pages
 * so the client status page and admin board update together.
 *
 * Works while the app runs as one Node process (`pnpm dev` / `pnpm start`).
 * With Supabase this is replaced by Supabase Realtime.
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

export function publish(event: AppEvent): void {
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
