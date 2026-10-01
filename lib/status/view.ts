import type { TimelineItem } from "@/components/ui/status-timeline";
import { flow, statusLabels, statusPage } from "@/lib/copy";
import type { Application, ApplicationStatus, DocumentItem } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format/date";

/**
 * What the client status page shows, derived from the application alone.
 * Pure functions: the same data always gives the same page, which is what
 * makes the live sync with admin trustworthy.
 */

export type NowView =
  | { kind: "upload"; document: DocumentItem; title: string; body: string; actionLabel: string }
  | { kind: "quotes"; title: string; body: string }
  | { kind: "info"; title: string; body: string };

/** Documents the client still has to act on, most urgent first. */
export function documentsToAct(app: Application): DocumentItem[] {
  const rank = (doc: DocumentItem) => (doc.status === "rejected" ? 0 : doc.required ? 1 : 2);
  return app.documents
    .filter((doc) => doc.status === "rejected" || (doc.status === "needed" && doc.required))
    .sort((a, b) => rank(a) - rank(b));
}

export function buildNow(app: Application): NowView {
  const copy = statusPage.now;
  const toAct = app.status === "covered" ? [] : documentsToAct(app);
  const next = toAct[0];

  if (next) {
    const name = flow.documentsInline[next.type];
    if (next.status === "rejected") {
      return {
        kind: "upload",
        document: next,
        title: copy.reupload.title(name),
        body: copy.reupload.body(next.rejectionReason ?? ""),
        actionLabel: copy.reupload.action(name),
      };
    }
    return {
      kind: "upload",
      document: next,
      title: copy.upload.title(name),
      body: toAct.length > 1 ? copy.upload.bodyMore(toAct.length - 1) : copy.upload.body,
      actionLabel: copy.upload.action(name),
    };
  }

  if (app.status === "quotes_ready") {
    return { kind: "quotes", ...copy.quotes_ready };
  }
  // They've sent what we asked for; the ball is in our court.
  if (app.status === "needs_info" && app.documents.some((doc) => doc.status === "uploaded")) {
    return { kind: "info", ...copy.checking };
  }
  return { kind: "info", ...copy[app.status] };
}

const ORDER: ApplicationStatus[] = [
  "received",
  "documents_checked",
  "preparing_quotes",
  "quotes_ready",
  "cover_chosen",
  "covered",
];

export function buildTimeline(app: Application): TimelineItem[] {
  const submitted = app.submittedAt ? formatDateTime(app.submittedAt) : undefined;
  const updated = formatDateTime(app.updatedAt);

  // "We need one more thing" is a detour after the documents arrive.
  if (app.status === "needs_info") {
    return [
      { id: "received", label: statusLabels.received, state: "done", meta: submitted },
      { id: "needs_info", label: statusLabels.needs_info, state: "current", meta: updated },
      ...ORDER.slice(1).map((status) => ({
        id: status,
        label: statusLabels[status],
        state: "upcoming" as const,
      })),
    ];
  }

  const current = ORDER.indexOf(app.status);
  return ORDER.map((status, index) => {
    const state = index < current || app.status === "covered" ? "done" : index === current ? "current" : "upcoming";
    const meta = status === "received" ? submitted : index === current ? updated : undefined;
    return { id: status, label: statusLabels[status], state, meta };
  });
}

/** Plain name of where the client is, for the pre-filled WhatsApp message. */
export function currentStepLabel(app: Application): string {
  const now = buildNow(app);
  return now.kind === "upload" ? now.title : statusLabels[app.status];
}
