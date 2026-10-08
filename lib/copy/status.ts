import type { ApplicationStatus } from "@/lib/data/types";

/** Client-facing status labels (CLAUDE.md §6). Plain language only. */
export const statusLabels: Record<ApplicationStatus, string> = {
  received: "Received",
  documents_checked: "Documents checked",
  preparing_quotes: "Preparing your quotes",
  needs_info: "We need one more thing",
  quotes_ready: "Choose your cover",
  cover_chosen: "Pay for your cover",
  paid: "Payment received",
  covered: "You're covered",
};

/** Client status page (/my/[ref]). The page always answers "what do I do now?". */
export const statusPage = {
  reference: (ref: string) => `Reference ${ref}`,
  nowHeading: "What to do now",
  stillNeeded: "Documents",
  progress: "Progress",
  quotesHeading: "Your quotes",
  priceHeading: "Your price",
  messageUs: "Message us on WhatsApp",
  messageUsHint: "Questions? Message us — we'll see your reference and where you are.",
  whatsappMessage: (ref: string, step: string) =>
    `Hello, this is about application ${ref}. Where I am: ${step}.`,
  liveNote: "This page updates by itself when anything changes.",
  updatedToast: (label: string) => `Update: ${label}`,

  notFound: {
    title: "We can't find that application",
    body: "Check the link in your message, or message us on WhatsApp with your reference.",
    action: "Go to the home page",
  },

  // "What to do now" for each situation. Uploads come first: they're the
  // only thing that can hold an application up.
  now: {
    renew: {
      title: (days: number) => (days <= 0 ? "Your cover has ended — renew now" : days === 1 ? "Your cover ends tomorrow" : `Your cover ends in ${days} days`),
      body: "Renew in two minutes: your details and documents are already filled in. Press “Renew now” below.",
    },
    docStillNeeded: (doc: string) => `Please also upload your ${doc} — we need it before we issue your cover.`,
    upload: {
      title: (doc: string) => `Upload your ${doc}`,
      body: "It's the last thing we need before we can send you quotes.",
      bodyMore: (count: number) =>
        `After that we need ${count} more ${count === 1 ? "document" : "documents"} — they're listed below.`,
      action: (doc: string) => `Upload ${doc}`,
    },
    reupload: {
      title: (doc: string) => `Upload a new ${doc}`,
      body: (reason: string) => `${reason} Everything else is fine.`,
      action: (doc: string) => `Upload ${doc}`,
    },
    checking: {
      title: "Nothing to do — we're checking what you sent",
      body: "We'll update this page as soon as we've looked at it.",
    },
    received: {
      title: "Nothing to do — we're checking your documents",
      body: "We'll update this page as soon as we've looked at them.",
    },
    documents_checked: {
      title: "Nothing to do — your documents are fine",
      body: "Next we compare insurers and prepare your quotes.",
    },
    preparing_quotes: {
      title: "Nothing to do — we're preparing your quotes",
      body: "We're comparing insurers for you. Your quotes will appear here.",
    },
    needs_info: {
      title: "We need one more thing",
      body: "Message us on WhatsApp and we'll tell you exactly what's missing.",
    },
    quotes_ready: {
      title: "Choose your cover",
      body: "Compare the insurers below and choose the one you want. You pay after you choose.",
    },
    cover_chosen: {
      title: "Pay for your cover",
      body: "Pay with M-Pesa. We issue your cover as soon as the payment arrives.",
    },
    paid: {
      title: "Nothing to do — we're issuing your cover",
      body: "Your payment arrived. We're getting your policy and certificate from the insurer.",
    },
    covered: {
      title: "You're covered",
      body: "Your cover is in place. Keep this page for your records.",
    },
  },

  upload: {
    dialogTitle: (doc: string) => `Upload your ${doc}`,
    dialogDescription: "A clear photo from your phone is fine.",
    label: (doc: string) => `Photo of your ${doc}`,
    reassurance: "Only our team sees your documents. They're stored securely and used only for this application.",
    toast: (doc: string) => `${doc} uploaded`,
  },

  documentHints: {
    needed: "Upload",
    rejected: "Upload again",
  },
  optional: "optional",

  quotes: {
    premium: "Total per year",
    premiumMonthly: "Total per month",
    cheapest: "Lowest price",
    breakdown: (basic: string, levies: string, extras?: string) =>
      extras ? `Premium ${basic} + extras ${extras} + levies ${levies}` : `Premium ${basic} + levies ${levies}`,
    premiumForTrip: "Premium for this trip",
    excess: (amount: string) => `Excess ${amount}`,
    choose: "Choose this cover",
    chosen: "Your choice",
    chosenToast: "Cover chosen",
    placeholderNote: "Demo: prices come from sample rate cards, not the insurers' real rates.",
    errors: {
      notReady: "These quotes can't be chosen any more. Refresh the page to see the latest.",
    },
  },

  timeline: {
    submitted: "Sent",
  },

  pay: {
    heading: "Payment",
    amount: "Amount to pay",
    action: (amount: string) => `Pay ${amount} with M-Pesa`,
    dialogTitle: "Pay with M-Pesa",
    dialogDescription: "We'll send a payment request to your phone. Enter your M-Pesa PIN to approve it.",
    phoneLabel: "M-Pesa number",
    send: "Send payment request",
    waitingTitle: "Check your phone",
    waitingBody: (phone: string) => `Enter your M-Pesa PIN on ${phone} to approve the payment. This page updates by itself.`,
    demoApprove: "Demo: approve on my phone",
    demoNote: "Demo: no real M-Pesa request is sent. Use the button to act as the phone.",
    cancel: "Close",
    retry: "Send a new request",
    sentToast: "Payment request sent",
    paidToast: "Payment received",
    receipt: (code: string) => `M-Pesa receipt ${code}`,
    paidOn: (date: string) => `Paid ${date}`,
    errors: {
      notReady: "This cover isn't waiting for payment any more. Refresh the page to see the latest.",
      phone: "Enter the Safaricom number to send the request to.",
    },
  },

  policy: {
    heading: "Your cover",
    insurer: "Insurer",
    cover: "Cover",
    policyNumber: "Policy number",
    certificate: "Certificate number",
    period: "Cover period",
    premium: "Premium paid",
    renewNote: (date: string) => `We'll remind you on WhatsApp and email before it ends on ${date}.`,
    renew: "Renew now",
    renewed: "Renewal started — your new quotes are ready",
    endsIn: (days: number) => (days === 1 ? "Ends tomorrow" : `Ends in ${days} days`),
    ended: "This cover has ended",
  },

  estimate: {
    heading: "Your instant estimate",
    range: (min: string, max: string) => `${min} – ${max}`,
    perYear: "a year, from 4 insurers",
    perTrip: "for this trip, from 4 insurers",
    note: "An estimate from your answers. Your quotes appear here shortly.",
  },
} as const;
