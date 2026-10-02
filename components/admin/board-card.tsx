import Link from "next/link";
import { ArrowRight, CircleCheck, Send } from "lucide-react";
import { coveredAction, sendQuotesAction } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { nudgeText } from "@/lib/admin/workflow";
import { admin, flow } from "@/lib/copy";
import type { BoardItem } from "@/lib/data/queries";
import { TOTAL_STEPS } from "@/lib/flow/screens";
import { formatAgo, formatDate } from "@/lib/format/date";
import { maskPhone } from "@/lib/format/mask";
import { summarizeWithProduct } from "@/lib/products/summary";
import { twilioConfigured } from "@/lib/notify/twilio";
import { isSampleNumber, whatsappUrlTo } from "@/lib/whatsapp";
import { ActionButton } from "./action-button";
import { AdminStatusBadge } from "./admin-status-badge";
import { NudgeButton } from "./nudge-button";

const reasonTone: Record<NonNullable<BoardItem["reason"]>, BadgeTone> = {
  new_submission: "new",
  stalled: "warn",
  replied: "info",
  documents_uploaded: "info",
  ready_to_quote: "info",
  cover_chosen: "success",
};

/** Why this row is here, in the broker's words: "Stopped at step 3 of 5 · 12 min ago". */
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

/** The one action that moves this application forward, right from the board. */
function RowAction({ item }: { item: BoardItem }) {
  const { application: app, client, reason } = item;
  const href = `/admin/${app.ref}`;
  const a = admin.actions;

  switch (reason) {
    case "ready_to_quote":
      return (
        <ActionButton
          action={sendQuotesAction}
          fields={{ ref: app.ref, from: "board" }}
          label={a.sendQuotesShort}
          icon={<Send aria-hidden />}
          variant="primary"
        />
      );
    case "cover_chosen":
      return (
        <ActionButton
          action={coveredAction}
          fields={{ ref: app.ref, from: "board" }}
          label={a.markCovered}
          icon={<CircleCheck aria-hidden />}
        />
      );
    case "new_submission":
    case "documents_uploaded":
    case "replied":
      return (
        <Button asChild variant="secondary">
          <Link href={href}>
            {reason === "replied" ? a.readReply : a.review}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      );
  }

  const owesSomething = reason === "stalled" || app.status === "needs_info" || app.status === "quotes_ready";
  if (!owesSomething || app.status === "covered" || !client) return null;

  const real = !isSampleNumber(client.phone);
  const auto = real && twilioConfigured(); // the server sends it via Twilio
  return (
    <NudgeButton
      refValue={app.ref}
      from="board"
      label={a.nudgeShort}
      whatsappUrl={real && !auto ? whatsappUrlTo(client.phone, nudgeText(app, client)) : undefined}
      title={auto ? admin.whatsapp.autoHint : real ? admin.whatsapp.realHint : admin.whatsapp.sampleHint}
    />
  );
}

/** One application on the board: who, what, why it's here, and the next action. */
export function BoardCard({ item, now }: { item: BoardItem; now: number }) {
  const { application: app, client, reason } = item;
  const summary = summarizeWithProduct(app);
  const name = client?.name || admin.noName;

  return (
    <div className="relative flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-alt sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar name={name} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* The link's hit area covers the whole row (after:inset-0). */}
            <TextLink
              href={`/admin/${app.ref}`}
              className="text-base text-ink no-underline after:absolute after:inset-0 hover:underline"
            >
              {name}
            </TextLink>
            {reason ? (
              <StatusBadge tone={reasonTone[reason]} label={admin.badges[reason]} />
            ) : app.submittedAt ? (
              <AdminStatusBadge status={app.status} />
            ) : null}
          </div>
          <p className="text-sm text-ink-quiet">
            {app.ref} · {client?.name ? summary : `${maskPhone(client?.phone ?? "")} · ${summary}`}
          </p>
          <p className="text-sm text-ink">{noteFor(item, now)}</p>
        </div>
      </div>
      <div className="relative z-10 shrink-0 self-start sm:self-auto">
        <RowAction item={item} />
      </div>
    </div>
  );
}
