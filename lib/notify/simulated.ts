import { publish, subscribe } from "@/lib/events";
import { renderTemplate, type Notifier, type OutboxItem } from "./types";

/**
 * SIMULATED notifier. Writes to an in-memory Outbox and publishes an
 * `outbox.sent` event (pages show a toast). Nothing is actually sent.
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
    outbox.items.unshift(item);
    publish({ type: "outbox.sent", id: item.id, ref: item.applicationRef });
    return structuredClone(item);
  },

  async listOutbox() {
    return structuredClone(outbox.items);
  },
};
