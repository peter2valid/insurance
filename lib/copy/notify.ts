import { brand } from "@/lib/brand";

/**
 * Pre-written message templates (CLAUDE.md §8.3–8.4). Every simulated
 * WhatsApp, SMS or email body comes from here, so tone stays consistent.
 */
export const notifyTemplates = {
  login_code: (d: { code: string }) =>
    `Your ${brand.name} code is ${d.code}. It expires in 10 minutes. Don't share it with anyone.`,

  application_submitted: (d: { ref: string; clientName: string; product: string; summary: string }) =>
    `New ${d.product} application ${d.ref} from ${d.clientName} (${d.summary}). Ready to check.`,

  application_stalled: (d: { ref: string; clientName: string; step: number; total: number }) =>
    `${d.clientName} stopped at step ${d.step} of ${d.total} on ${d.ref}. You can nudge them on WhatsApp.`,

  status_changed: (d: { firstName: string; ref: string; detail: string; linkLabel: string; link: string }) =>
    `Hi ${d.firstName}, ${d.detail} (${d.ref})\n\n${d.linkLabel}:\n${d.link}\n\nQuestions? Just reply to this message.`,

  document_requested: (d: { firstName: string; ref: string; document: string; reason: string; link: string }) =>
    `Hi ${d.firstName}, we need a new ${d.document} for ${d.ref}. ${d.reason}\n\nUpload it here (takes a minute):\n${d.link}\n\nQuestions? Just reply to this message.`,

  document_uploaded: (d: { ref: string; clientName: string; document: string }) =>
    `${d.clientName} uploaded their ${d.document} for ${d.ref}. It's ready to check.`,

  cover_chosen: (d: { ref: string; clientName: string; insurer: string; premium: string }) =>
    `${d.clientName} chose ${d.insurer} (${d.premium} a year) on ${d.ref}. Ready to finalise.`,

  nudge: (d: { firstName: string; product: string; ref: string; submitted: boolean; link: string }) =>
    d.submitted
      ? `Hi ${d.firstName}, a quick reminder about your ${d.product} insurance (${d.ref}). There's one thing waiting for you.\n\nSee what to do next:\n${d.link}\n\nQuestions? Just reply to this message.`
      : `Hi ${d.firstName}, you're nearly done with your ${d.product} insurance application (${d.ref}). It takes about 2 more minutes.\n\nPick up exactly where you stopped:\n${d.link}\n\nQuestions? Just reply to this message.`,
} as const;

/** Labels for the admin Outbox panel. */
export const notifyLabels = {
  simulatedNote: "Demo: messages are not really sent. This list shows what would go out.",
  channels: { whatsapp: "WhatsApp", sms: "SMS", email: "Email" },
  toAdmin: "To you",
} as const;

/**
 * What each status update says, and the action link at the bottom.
 * `anchor` jumps straight to the right part of the status page.
 */
export const statusMessages = {
  received: { detail: "we've got your application. We'll check your documents next.", linkLabel: "Follow your application", anchor: "" },
  documents_checked: { detail: "your documents are fine. We're preparing your quotes now.", linkLabel: "Follow your application", anchor: "" },
  preparing_quotes: { detail: "we're comparing insurers for you. Your quotes are on the way.", linkLabel: "Follow your application", anchor: "" },
  needs_info: { detail: "we need one more thing from you.", linkLabel: "See what we need", anchor: "#documents" },
  quotes_ready: { detail: "your quotes are ready. Compare 3 insurers and pick one.", linkLabel: "Choose your cover", anchor: "#quotes" },
  cover_chosen: { detail: "thanks for choosing your cover. We're finalising it with the insurer.", linkLabel: "Follow your application", anchor: "" },
  covered: { detail: "you're covered! Your cover is in place.", linkLabel: "See your cover details", anchor: "" },
} as const;
