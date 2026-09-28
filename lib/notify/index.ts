import { simulatedNotifier } from "./simulated";
import type { Notifier } from "./types";

export * from "./types";

/**
 * Notification interface (CLAUDE.md §8.4):
 *   send({ channel, to, template, data })
 *
 * SIMULATED today: messages go to an in-memory Outbox shown in admin, and
 * never leave the app. Later: WhatsApp Business API / SMS / email
 * providers implement `Notifier` and `getNotifier()` returns them.
 */

export function getNotifier(): Notifier {
  return simulatedNotifier;
}
