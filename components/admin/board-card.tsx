import { MessageCircle } from "lucide-react";
import { nudgeAction } from "@/app/admin/actions";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { admin, flow } from "@/lib/copy";
import type { BoardItem } from "@/lib/data/queries";
import { TOTAL_STEPS } from "@/lib/flow/screens";
import { formatAgo, formatDate } from "@/lib/format/date";
import { maskPhone } from "@/lib/format/mask";
import { ActionButton } from "./action-button";
import { AdminStatusBadge } from "./admin-status-badge";
import { ApplicationCard } from "./application-card";

const reasonTone: Record<NonNullable<BoardItem["reason"]>, BadgeTone> = {
  new_submission: "new",
  stalled: "warn",
  replied: "info",
  documents_uploaded: "info",
  ready_to_quote: "info",
  cover_chosen: "success",
};

/** Why this card is here, in the broker's words: "Stopped at step 3 of 5 · 12 min ago". */
function noteFor(item: BoardItem, now: number): string {
  const { application: app, reason } = item;
  const ago = formatAgo(app.updatedAt, now);
  const n = admin.notes;
  switch (reason) {
    case "new_submission":
      return n.new_submission(formatAgo(app.submittedAt ?? app.updatedAt, now));
    case "stalled":
      return n.stalled(Math.min(app.step + 1, TOTAL_STEPS), TOTAL_STEPS, ago);
    case "replied":
      return n.replied(ago);
    case "documents_uploaded":
      return n.documents_uploaded(ago);
    case "ready_to_quote":
      return n.ready_to_quote;
    case "cover_chosen":
      return n.cover_chosen(ago);
  }
  if (!app.submittedAt) return n.inProgress(Math.min(app.step + 1, TOTAL_STEPS), TOTAL_STEPS, ago);
  if (app.status === "covered") return n.covered(formatDate(app.updatedAt));
  if (app.status === "quotes_ready") return n.quotesSent(ago);
  const owed = app.documents.find((doc) => doc.required && (doc.status === "needed" || doc.status === "rejected"));
  return owed ? n.waitingFor(flow.documentsInline[owed.type], ago) : n.waitingGeneric(ago);
}

export function BoardCard({ item, now }: { item: BoardItem; now: number }) {
  const { application: app, client, reason } = item;
  const vehicle = [app.details.make, app.details.model, app.details.plate].filter(Boolean).join(" ") || admin.noVehicle;

  // Stalled drafts and clients who owe a document get the nudge.
  const canNudge =
    reason === "stalled" || (!reason && app.status !== "covered" && (app.status === "needs_info" || app.status === "quotes_ready"));

  return (
    <ApplicationCard
      href={`/admin/${app.ref}`}
      name={client?.name || admin.noName}
      reference={app.ref}
      vehicle={client?.name ? vehicle : `${maskPhone(client?.phone ?? "")} · ${vehicle}`}
      note={noteFor(item, now)}
      badge={
        reason ? (
          <StatusBadge tone={reasonTone[reason]} label={admin.badges[reason]} />
        ) : app.submittedAt ? (
          <AdminStatusBadge status={app.status} />
        ) : undefined
      }
      action={
        canNudge ? (
          <ActionButton
            action={nudgeAction}
            fields={{ ref: app.ref, from: "board" }}
            label={admin.actions.nudge}
            icon={<MessageCircle aria-hidden />}
            block
          />
        ) : undefined
      }
    />
  );
}
