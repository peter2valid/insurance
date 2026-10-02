import { getSupabase } from "@/lib/data/supabase-client";
import { publish, subscribe } from "@/lib/events";
import { renderTemplate, type Notifier, type OutboxItem } from "./types";

/**
 * SIMULATED notifier. Writes to the Outbox — a Supabase table when
 * configured, otherwise in memory — and records a change so admin pages
 * show a toast. Nothing is actually sent.
 * Never logs message contents: they contain personal data (CLAUDE.md §9).
 */

type Outbox = { items: OutboxItem[]; nextId: number; resetHooked: boolean };

const globalOutbox = globalThis as unknown as { __beaconOutbox?: Outbox };
const outbox = (globalOutbox.__beaconOutbox ??= { items: [], nextId: 1, resetHooked: false });

// Clear the outbox when the demo data is reset.
if (!outbox.resetHooked) {
  outbox.resetHooked = true;
  subscribe((event) => {
    if (event.type === "demo.reset") outbox.items = [];
  });
}

export const simulatedNotifier: Notifier = {
  async send(input) {
    const item: OutboxItem = {
      id: `out-${outbox.nextId++}`,
      channel: input.channel,
      to: input.to,
      audience: input.audience,
      template: input.template,
      body: renderTemplate(input.template, input.data),
      applicationRef: input.applicationRef,
      createdAt: new Date().toISOString(),
      simulated: true,
    };
    const db = getSupabase();
    if (db) {
      item.id = `out-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      await db.from("outbox").insert({
        id: item.id,
        channel: item.channel,
        recipient: item.to,
        audience: item.audience,
        template: item.template,
        body: item.body,
        application_ref: item.applicationRef ?? null,
        created_at: item.createdAt,
      });
      // A change with no ref reaches every admin page (for the toast).
      await db.from("changes").insert({ ref: null });
      return item;
    }
    outbox.items.unshift(item);
    publish({ type: "outbox.sent", id: item.id, ref: item.applicationRef });
    return structuredClone(item);
  },

  async listOutbox() {
    const db = getSupabase();
    if (db) {
      const { data } = await db.from("outbox").select("*").order("created_at", { ascending: false }).limit(200);
      return (data ?? []).map((row) => ({
        id: row.id as string,
        channel: row.channel as OutboxItem["channel"],
        to: row.recipient as string,
        audience: row.audience as OutboxItem["audience"],
        template: row.template as OutboxItem["template"],
        body: row.body as string,
        applicationRef: (row.application_ref as string) ?? undefined,
        createdAt: row.created_at as string,
        simulated: true as const,
      }));
    }
    return structuredClone(outbox.items);
  },
};
