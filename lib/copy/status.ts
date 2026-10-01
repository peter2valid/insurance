import type { ApplicationStatus } from "@/lib/data/types";

/** Client-facing status labels (CLAUDE.md §6). Plain language only. */
export const statusLabels: Record<ApplicationStatus, string> = {
  received: "Received",
  documents_checked: "Documents checked",
  preparing_quotes: "Preparing your quotes",
  needs_info: "We need one more thing",
  quotes_ready: "Choose your cover",
  cover_chosen: "Finalising",
  covered: "You're covered",
};

/** Client status page (/my/[ref]). The page always answers "what do I do now?". */
export const statusPage = {
  reference: (ref: string) => `Reference ${ref}`,
  nowHeading: "What to do now",
  stillNeeded: "Documents",
  progress: "Progress",
  quotesHeading: "Your quotes",
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
      body: "Compare the quotes below and choose the one you want. We'll finalise it for you.",
    },
    cover_chosen: {
      title: "Nothing to do — we're finalising your cover",
      body: "We'll tell you how to pay and when you're covered.",
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
    premium: "Premium per year",
    premiumForTrip: "Premium for this trip",
    excess: (amount: string) => `Excess ${amount}`,
    choose: "Choose this cover",
    chosen: "Your choice",
    chosenToast: "Cover chosen",
    placeholderNote: "Insurer names are placeholders until partners are confirmed.",
    errors: {
      notReady: "These quotes can't be chosen any more. Refresh the page to see the latest.",
    },
  },

  timeline: {
    submitted: "Sent",
  },
} as const;
