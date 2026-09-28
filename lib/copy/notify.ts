import { brand } from "@/lib/brand";

/**
 * Pre-written message templates (CLAUDE.md §8.3–8.4). Every simulated
 * WhatsApp, SMS or email body comes from here, so tone stays consistent.
 */
export const notifyTemplates = {
  login_code: (d: { code: string }) =>
    `Your ${brand.name} code is ${d.code}. It expires in 10 minutes. Don't share it with anyone.`,

  application_submitted: (d: { ref: string; clientName: string; vehicle: string }) =>
    `New motor application ${d.ref} from ${d.clientName} (${d.vehicle}). Documents are ready to check.`,

  application_stalled: (d: { ref: string; clientName: string; step: number; total: number }) =>
    `${d.clientName} stopped at step ${d.step} of ${d.total} on ${d.ref}. You can nudge them on WhatsApp.`,

  status_changed: (d: { firstName: string; ref: string; statusLabel: string; link: string }) =>
    `Hi ${d.firstName}, an update on your application ${d.ref}: ${d.statusLabel}. See what's next: ${d.link}`,

  document_requested: (d: { firstName: string; ref: string; document: string; reason: string; link: string }) =>
    `Hi ${d.firstName}, we need a new ${d.document} for ${d.ref}. ${d.reason} Upload it here: ${d.link}`,

  nudge: (d: { firstName: string; link: string }) =>
    `Hi ${d.firstName}, you're nearly done with your motor insurance application. Pick up where you left off: ${d.link}`,
} as const;

/** Labels for the admin Outbox panel. */
export const notifyLabels = {
  simulatedNote: "Demo: messages are not really sent. This list shows what would go out.",
  channels: { whatsapp: "WhatsApp", sms: "SMS", email: "Email" },
  toAdmin: "To you",
} as const;
