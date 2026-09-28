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
  | "new_submission"
  | "stalled"
  | "replied"
  | "documents_uploaded"
  | "ready_to_quote"
  | "cover_chosen";

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
    return isStalled(app, now)
      ? { bucket: "needs_me", reason: "stalled" }
      : { bucket: "waiting" };
  }
  if (unreadReplies > 0 && app.status !== "covered") {
    return { bucket: "needs_me", reason: "replied" };
  }
  switch (app.status) {
    case "received":
      return { bucket: "needs_me", reason: "new_submission" };
    case "documents_checked":
    case "preparing_quotes":
      return { bucket: "needs_me", reason: "ready_to_quote" };
    case "needs_info":
      return app.documents.some((doc) => doc.status === "uploaded")
        ? { bucket: "needs_me", reason: "documents_uploaded" }
        : { bucket: "waiting" };
    case "quotes_ready":
      return { bucket: "quotes_out" };
    case "cover_chosen":
      return { bucket: "needs_me", reason: "cover_chosen" };
    case "covered":
      return { bucket: "done" };
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

  // Needs me: longest-waiting first. Others: most recent first.
  const byUpdated = (a: BoardEntry, b: BoardEntry) =>
    Date.parse(a.application.updatedAt) - Date.parse(b.application.updatedAt);
  board.needs_me.sort(byUpdated);
  for (const bucket of ["waiting", "quotes_out", "done"] as const) {
    board[bucket].sort((a, b) => byUpdated(b, a));
  }
  return board;
}
