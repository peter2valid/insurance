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

/** Client status page (/my/[ref]). */
export const statusPage = {
  reference: (ref: string) => `Reference ${ref}`,
  nowHeading: "What to do now",
  stillNeeded: "Still needed",
  progress: "Progress",
  messageUs: "Message us on WhatsApp",
  messageUsHint: "We'll see your reference and where you are.",
  whatsappMessage: (ref: string, step: string) =>
    `Hello, this is about application ${ref}. Where I am: ${step}.`,

  notFound: {
    title: "We can't find that application",
    body: "Check the link in your message, or message us on WhatsApp with your reference.",
  },

  // Stage 3 placeholder content. Replaced in Stage 7.
  placeholder: {
    ref: "BC-4821",
    vehicle: "Toyota Fielder · KDA 123A",
    nowTitle: "Upload your KRA PIN certificate",
    nowBody: "It's the last thing we need before we send you quotes.",
    kraPin: "KRA PIN certificate",
    logbook: "Logbook",
    id: "National ID",
    upload: "Upload KRA PIN certificate",
    receivedMeta: "28 Sep, 10:40",
  },
} as const;
