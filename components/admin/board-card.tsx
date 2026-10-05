import Link from "next/link";
import { ArrowRight, CircleCheck, RefreshCw, Send, UserRound } from "lucide-react";
import { sendQuotesAction, verifyAllAction } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { nudgeText } from "@/lib/admin/workflow";
import { admin, flow } from "@/lib/copy";
import type { BoardItem } from "@/lib/data/queries";
import type { AttentionReason } from "@/lib/data/rules";
import { TOTAL_STEPS } from "@/lib/flow/screens";
import { formatAgo, formatDate, todayIso } from "@/lib/format/date";
import { maskPhone } from "@/lib/format/mask";
import { formatKes } from "@/lib/format/money";
import { twilioConfigured } from "@/lib/notify/twilio";
import { summarizeWithProduct } from "@/lib/products/summary";
import { isSampleNumber, whatsappUrlTo } from "@/lib/whatsapp";
import { ActionButton } from "./action-button";
import { AdminStatusBadge } from "./admin-status-badge";
import { IssueCoverDialog } from "./issue-cover-dialog";
import { NudgeButton } from "./nudge-button";

const reasonTone: Record<AttentionReason, BadgeTone> = {
  paid: "success",
  new_submission: "new",
  stalled: "warn",
  replied: "info",
  documents_uploaded: "info",
  ready_to_quote: "info",
};

/** Why this row is here, in the broker's words: "Stopped at step 3 of 5 · 12 min ago". */
function noteFor(item: BoardItem, now: number): string {
  const { application: app, reason, chosen, payment } = item;
  const ago = formatAgo(app.updatedAt, now);
  const n = admin.notes;
  switch (reason) {
    case "paid":
      return n.paid(formatKes(payment?.amountKes ?? chosen?.premiumKes ?? 0), formatAgo(payment?.paidAt ?? app.updatedAt, now));
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
  }
  if (!app.submittedAt) return n.inProgress(Math.min(app.step + 1, TOTAL_STEPS), TOTAL_STEPS, ago);
  if (app.status === "covered") return n.covered(formatDate(app.policy?.startsAt ?? app.updatedAt));
  if (app.status === "cover_chosen") return n.awaitingPayment(formatKes(chosen?.premiumKes ?? 0), ago);
  if (app.status === "quotes_ready") return n.quotesSent(ago);
  const owed = app.documents.find((doc) => doc.required && (doc.status === "needed" || doc.status === "rejected"));
  return owed ? n.waitingFor(flow.documentsInline[owed.type], ago) : n.waitingGeneric(ago);
}

/** The one action that moves this application forward, right from the list. */
function RowAction({ item, from }: { item: BoardItem; from: string }) {
  const { application: app, client, reason } = item;
  const href = `/admin/${app.ref}`;
  const a = admin.actions;
  const docsDone = app.documents.every((doc) => !doc.required || doc.status === "verified");

  switch (reason) {
    case "paid":
      return docsDone ? (
        <IssueCoverDialog refValue={app.ref} from={from} today={todayIso()} />
      ) : (
        <Button asChild>
          <Link href={href}>
            {a.review}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      );
    case "ready_to_quote":
      return (
        <ActionButton action={sendQuotesAction} fields={{ ref: app.ref, from }} label={a.sendQuotesShort} icon={<Send aria-hidden />} variant="primary" />
      );
    case "documents_uploaded":
      return (
        <ActionButton action={verifyAllAction} fields={{ ref: app.ref, from }} label={a.verifyAll} icon={<CircleCheck aria-hidden />} />
      );
    case "new_submission":
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

  const owesSomething =
    reason === "stalled" || app.status === "needs_info" || app.status === "quotes_ready" || app.status === "cover_chosen";
  if (!owesSomething || app.status === "covered" || !client) return null;

  const real = !isSampleNumber(client.phone);
  const auto = real && twilioConfigured(); // the server sends it via Twilio
  return (
    <NudgeButton
      refValue={app.ref}
      from={from}
      label={a.nudgeShort}
      whatsappUrl={real && !auto ? whatsappUrlTo(client.phone, nudgeText(app, client)) : undefined}
      title={auto ? admin.whatsapp.autoHint : real ? admin.whatsapp.realHint : admin.whatsapp.sampleHint}
    />
  );
}

/** One application in a list: who, what, why it's here, and the next action. */
export function BoardCard({ item, now, from = "board" }: { item: BoardItem; now: number; from?: string }) {
  const { application: app, client, reason, agent } = item;
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
              className="text-base font-medium text-ink no-underline after:absolute after:inset-0 hover:underline"
            >
              {name}
            </TextLink>
            {reason ? (
              <StatusBadge tone={reasonTone[reason]} label={admin.badges[reason]} />
            ) : app.submittedAt ? (
              <AdminStatusBadge status={app.status} />
            ) : null}
            {app.details.renewalOf && <StatusBadge tone="neutral" label={admin.notes.renewal} icon={RefreshCw} />}
          </div>
          <p className="text-sm text-ink-quiet">
            {app.ref} · {client?.name ? summary : `${maskPhone(client?.phone ?? "")} · ${summary}`}
          </p>
          <p className="text-sm text-ink">{noteFor(item, now)}</p>
          {agent && (
            <p className="flex items-center gap-1 text-xs text-ink-quiet">
              <UserRound className="size-3" aria-hidden />
              {admin.notes.agent(agent.name)}
            </p>
          )}
        </div>
      </div>
      <div className="relative z-10 shrink-0 self-start sm:self-auto">
        <RowAction item={item} from={from} />
      </div>
    </div>
  );
}
