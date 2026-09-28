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
