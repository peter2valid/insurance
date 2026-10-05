import type { Application, Message } from "./types";

/**
 * Business rules shared by every repo implementation: what counts as
 * stalled, and which admin bucket an application belongs in.
 * Pure functions — no storage, easy to reason about.
 */

/** A draft with no activity for this long is "stalled" (CLAUDE.md §8.3). */
export const STALL_AFTER_MS = 10 * 60 * 1000;

export function isStalled(app: Application, now: number = Date.now()): boolean {
  return !app.submittedAt && now - Date.parse(app.updatedAt) >= STALL_AFTER_MS;
}

export type Bucket = "needs_me" | "waiting" | "quotes_out" | "done";

/** Why an application needs the admin. Mapped to words in lib/copy/admin. */
export type AttentionReason =
  | "paid"
  | "new_submission"
  | "stalled"
  | "replied"
  | "documents_uploaded"
  | "ready_to_quote";

/** Most urgent first: money received beats everything. */
export const reasonPriority: Record<AttentionReason, number> = {
  paid: 0,
  replied: 1,
  new_submission: 2,
  documents_uploaded: 3,
  ready_to_quote: 4,
  stalled: 5,
};

export interface BoardEntry {
  application: Application;
  bucket: Bucket;
  reason?: AttentionReason;
}

/**
 * Sort an application into one of the four admin buckets.
 * "The broker never has to wonder what needs doing."
 */
export function classify(
  app: Application,
  unreadReplies: number,
  now: number = Date.now(),
): Omit<BoardEntry, "application"> {
  if (!app.submittedAt) {
    return isStalled(app, now) ? { bucket: "needs_me", reason: "stalled" } : { bucket: "waiting" };
  }
  if (app.status === "covered") return { bucket: "done" };
  if (app.status === "paid") return { bucket: "needs_me", reason: "paid" };
  if (unreadReplies > 0) return { bucket: "needs_me", reason: "replied" };
  if (app.status === "received") return { bucket: "needs_me", reason: "new_submission" };
  // Documents waiting to be checked, at any stage before cover.
  if (app.documents.some((doc) => doc.status === "uploaded")) return { bucket: "needs_me", reason: "documents_uploaded" };
  switch (app.status) {
    case "documents_checked":
    case "preparing_quotes":
      return { bucket: "needs_me", reason: "ready_to_quote" };
    case "needs_info":
      return { bucket: "waiting" };
    case "quotes_ready":
    case "cover_chosen":
      return { bucket: "quotes_out" };
  }
}

/** Build the board: every application in exactly one bucket, oldest need first. */
export function buildBoard(
  apps: Application[],
  messages: Message[],
  now: number = Date.now(),
): Record<Bucket, BoardEntry[]> {
  const unread = new Map<string, number>();
  for (const message of messages) {
    if (message.direction === "in" && !message.read) {
      unread.set(message.applicationRef, (unread.get(message.applicationRef) ?? 0) + 1);
    }
  }

  const board: Record<Bucket, BoardEntry[]> = { needs_me: [], waiting: [], quotes_out: [], done: [] };
  for (const application of apps) {
    const { bucket, reason } = classify(application, unread.get(application.ref) ?? 0, now);
    board[bucket].push({ application, bucket, reason });
  }

  // Needs me: most urgent reason first, then longest-waiting. Others: most recent first.
  const byUpdated = (a: BoardEntry, b: BoardEntry) =>
    Date.parse(a.application.updatedAt) - Date.parse(b.application.updatedAt);
  board.needs_me.sort(
    (a, b) => reasonPriority[a.reason ?? "stalled"] - reasonPriority[b.reason ?? "stalled"] || byUpdated(a, b),
  );
  for (const bucket of ["waiting", "quotes_out", "done"] as const) {
    board[bucket].sort((a, b) => byUpdated(b, a));
  }
  return board;
}
