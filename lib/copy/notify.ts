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

  payment_received_admin: (d: { ref: string; clientName: string; amount: string; receipt: string; insurer: string }) =>
    `Paid: ${d.clientName} paid ${d.amount} for ${d.insurer} on ${d.ref} (M-Pesa ${d.receipt}). Issue the cover.`,

  payment_receipt: (d: { firstName: string; ref: string; amount: string; receipt: string; link: string }) =>
    `Hi ${d.firstName}, we've received ${d.amount} for ${d.ref} (M-Pesa ${d.receipt}). Thank you! We're issuing your cover now.\n\nFollow it here:\n${d.link}`,

  cover_issued: (d: { firstName: string; ref: string; insurer: string; policyNumber: string; endsOn: string; link: string }) =>
    `Hi ${d.firstName}, you're covered! ${d.insurer} policy ${d.policyNumber} is active until ${d.endsOn} (${d.ref}).\n\nSee your cover details:\n${d.link}\n\nWe'll remind you before it ends.`,

  quote_reminder: (d: { firstName: string; ref: string; cheapest: string; link: string }) =>
    `Hi ${d.firstName}, your insurance quotes for ${d.ref} are waiting, from ${d.cheapest}.\n\nChoose your cover (takes a minute):\n${d.link}\n\nQuestions? Just reply to this message.`,

  payment_reminder: (d: { firstName: string; ref: string; amount: string; link: string }) =>
    `Hi ${d.firstName}, your cover for ${d.ref} is ready once you pay ${d.amount}.\n\nPay with M-Pesa here:\n${d.link}\n\nQuestions? Just reply to this message.`,

  renewal_reminder: (d: { firstName: string; days: number; insurer: string; plate: string; endsOn: string; link: string }) =>
    `Hi ${d.firstName}, your ${d.insurer} cover${d.plate ? ` for ${d.plate}` : ""} ends in ${d.days} ${d.days === 1 ? "day" : "days"} (${d.endsOn}). Don't drive uninsured.\n\nRenew in 2 minutes — your details are already filled in:\n${d.link}`,

  renewals_due_admin: (d: { count: number; list: string }) =>
    `${d.count} ${d.count === 1 ? "cover ends" : "covers end"} in the next 30 days:\n${d.list}`,

  agent_welcome: (d: { firstName: string; code: string; link: string; portal: string }) =>
    `Welcome, ${d.firstName}! You're now an agent. Your code is ${d.code}.\n\nShare your link — every client who applies through it earns you commission:\n${d.link}\n\nSee your clients and earnings:\n${d.portal}`,

  agent_applied_admin: (d: { name: string; phone: string }) =>
    `New agent request from ${d.name} (${d.phone}). Approve them in Agents.`,

  agent_commission: (d: { firstName: string; amount: string; clientName: string; ref: string; portal: string }) =>
    `Good news, ${d.firstName}: ${d.clientName} paid for their cover (${d.ref}). You've earned ${d.amount} commission.\n\nSee your earnings:\n${d.portal}`,

  agent_paid: (d: { firstName: string; amount: string; portal: string }) =>
    `Hi ${d.firstName}, we've paid you ${d.amount} in commission. Thank you for your referrals!\n\n${d.portal}`,

  nudge: (d: { firstName: string; product: string; ref: string; submitted: boolean; link: string }) =>
    d.submitted
      ? `Hi ${d.firstName}, a quick reminder about your ${d.product} insurance (${d.ref}). There's one thing waiting for you.\n\nSee what to do next:\n${d.link}\n\nQuestions? Just reply to this message.`
      : `Hi ${d.firstName}, you're nearly done with your ${d.product} insurance application (${d.ref}). It takes about 2 more minutes.\n\nPick up exactly where you stopped:\n${d.link}\n\nQuestions? Just reply to this message.`,
} as const;

/** Email subject lines, per template. */
export const notifySubjects: Partial<Record<keyof typeof notifyTemplates, string>> = {
  application_submitted: "New application",
  status_changed: "Update on your insurance application",
  document_requested: "We need a document from you",
  document_uploaded: "A client uploaded a document",
  cover_chosen: "A client chose their cover",
  payment_received_admin: "Payment received — issue the cover",
  payment_receipt: "We've received your payment",
  cover_issued: "You're covered",
  quote_reminder: "Your insurance quotes are waiting",
  payment_reminder: "Your cover is ready once you pay",
  renewal_reminder: "Your insurance is ending soon",
  renewals_due_admin: "Renewals due in the next 30 days",
  agent_welcome: "Welcome — you're now an agent",
  agent_applied_admin: "New agent request",
  agent_commission: "You've earned commission",
  agent_paid: "Commission paid",
  nudge: "You're nearly done",
};

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
  quotes_ready: { detail: "your quotes are ready. Compare the insurers and choose one.", linkLabel: "Choose your cover", anchor: "#quotes" },
  cover_chosen: { detail: "thanks for choosing your cover. Pay with M-Pesa and we'll issue it straight away.", linkLabel: "Pay for your cover", anchor: "#payment" },
  paid: { detail: "we've received your payment. We're issuing your cover now.", linkLabel: "Follow your application", anchor: "" },
  covered: { detail: "you're covered! Your cover is in place.", linkLabel: "See your cover details", anchor: "" },
} as const;
