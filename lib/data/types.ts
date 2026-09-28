/**
 * Domain types. Stage 2 defines only what the kit needs (status and
 * document states); Stage 4 adds Application, Client, Quote and Message.
 */

export type ApplicationStatus =
  | "received"
  | "documents_checked"
  | "preparing_quotes"
  | "needs_info"
  | "quotes_ready"
  | "cover_chosen"
  | "covered";

export const applicationStatuses: readonly ApplicationStatus[] = [
  "received",
  "documents_checked",
  "preparing_quotes",
  "needs_info",
  "quotes_ready",
  "cover_chosen",
  "covered",
];

export type DocumentStatus = "needed" | "uploaded" | "verified" | "rejected";
