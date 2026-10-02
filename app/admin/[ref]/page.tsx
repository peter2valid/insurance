import Link from "next/link";
import { CircleCheck, FileText, SearchX, Send } from "lucide-react";
import { coveredAction, quotesReadyAction, sendQuotesAction, verifyAction, verifyAllAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { AdminDetail, AnswerList } from "@/components/admin/admin-detail";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { NudgeButton } from "@/components/admin/nudge-button";
import { QuoteDialog } from "@/components/admin/quote-dialog";
import { ReuploadDialog } from "@/components/admin/reupload-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { admin, flow, kit, productNames } from "@/lib/copy";
import { answerRows, isQuestionScreen, type QuestionScreenId } from "@/lib/flow/questions";
import { flows } from "@/lib/flow/screens";
import { getRepo } from "@/lib/data/repo";
import type { Application, Client, DocumentItem, Message, Quote } from "@/lib/data/types";
import { getQuoteProvider } from "@/lib/data/quote-provider";
import { nudgeText } from "@/lib/admin/workflow";
import { twilioConfigured } from "@/lib/notify/twilio";
import { isSampleNumber, whatsappUrlTo } from "@/lib/whatsapp";
import { formatDateTime } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { formatKenyanPhone } from "@/lib/format/phone";

const docTone: Record<DocumentItem["status"], BadgeTone> = {
  needed: "neutral",
  uploaded: "new",
  verified: "success",
  rejected: "danger",
};

/**
 * Admin detail (CLAUDE.md §8.3): documents on the left, answers on the
 * right, so they can be checked against each other. Every action updates
 * the client's page at once and sends a simulated message.
 */
export default async function AdminApplicationPage(props: PageProps<"/admin/[ref]">) {
  const { ref } = await props.params;
  const repo = getRepo();
  const app = await repo.getApplication(ref);

  if (!app) {
    return (
      <EmptyState
        tone="error"
        icon={SearchX}
        title={admin.detail.notFound.title}
        body={admin.detail.notFound.body}
        action={
          <Button asChild variant="secondary">
            <Link href="/admin">{admin.backToBoard}</Link>
          </Button>
        }
      />
    );
  }

  const [client, quotes, messages] = await Promise.all([
    repo.getClient(app.clientId),
    repo.listQuotes(ref),
    repo.listMessages(ref),
  ]);
  // Opening the application counts as reading the client's replies.
  if (messages.some((message) => message.direction === "in" && !message.read)) await repo.markMessagesRead(ref);

  const suggestion = (await getQuoteProvider().suggest(app))[quotes.length % 3];

  return (
    <AdminDetail
      backHref="/admin"
      name={client?.name || admin.noName}
      reference={app.ref}
      badges={app.submittedAt ? <AdminStatusBadge status={app.status} /> : undefined}
      nextStep={<NextStep app={app} client={client} quotes={quotes} suggestion={suggestion} />}
      documents={<Documents app={app} />}
      answers={
        <div className="flex flex-col gap-6">
          <AnswerList items={answers(app, client?.name, client?.phone)} />
          <QuotesSummary quotes={quotes} />
          <Messages messages={messages} />
        </div>
      }
    />
  );
}

function NextStep({
  app,
  client,
  quotes,
  suggestion,
}: {
  app: Application;
  client: Client | null;
  quotes: Quote[];
  suggestion?: { insurer: string; coverType: string; premiumKes: number; excessKes?: number };
}) {
  const n = admin.next;
  const toCheck = app.documents.some((doc) => doc.status === "uploaded");
  const owed = app.documents.some((doc) => doc.required && (doc.status === "needed" || doc.status === "rejected"));
  const real = client ? !isSampleNumber(client.phone) : false;
  const auto = real && twilioConfigured(); // the server sends it via Twilio
  const nudgeButton = (
    <NudgeButton
      refValue={app.ref}
      label={admin.actions.nudge}
      whatsappUrl={client && real && !auto ? whatsappUrlTo(client.phone, nudgeText(app, client)) : undefined}
      title={auto ? admin.whatsapp.autoHint : real ? admin.whatsapp.realHint : admin.whatsapp.sampleHint}
    />
  );

  let copy: { title: string; body: string } = n.covered;
  let actions: React.ReactNode = null;

  if (!app.submittedAt) {
    copy = n.draft;
    actions = nudgeButton;
  } else if (toCheck) {
    copy = n.check;
    actions = (
      <ActionButton
        action={verifyAllAction}
        fields={{ ref: app.ref }}
        label={admin.actions.verifyAll}
        icon={<CircleCheck aria-hidden />}
        variant="primary"
      />
    );
  } else if (owed && app.status !== "covered") {
    copy = n.waitingDocs;
    actions = nudgeButton;
  } else if (app.status === "documents_checked" || app.status === "preparing_quotes") {
    copy = quotes.length > 0 ? n.quotesReady : n.addQuotes;
    actions =
      quotes.length > 0 ? (
        <>
          <ActionButton
            action={quotesReadyAction}
            fields={{ ref: app.ref }}
            label={admin.actions.markQuotesReady}
            variant="primary"
          />
          <QuoteDialog refValue={app.ref} product={app.product} suggestion={suggestion} variant="secondary" />
        </>
      ) : (
        <>
          <ActionButton
            action={sendQuotesAction}
            fields={{ ref: app.ref }}
            label={admin.actions.sendQuotes}
            icon={<Send aria-hidden />}
            variant="primary"
          />
          <QuoteDialog
            refValue={app.ref}
            product={app.product}
            suggestion={suggestion}
            variant="ghost"
            label={admin.actions.addQuoteManually}
          />
        </>
      );
  } else if (app.status === "quotes_ready") {
    copy = n.waitingChoice;
    actions = nudgeButton;
  } else if (app.status === "cover_chosen") {
    copy = n.finalise;
    actions = (
      <ActionButton action={coveredAction} fields={{ ref: app.ref }} label={admin.actions.markCovered} icon={<CircleCheck aria-hidden />} variant="primary" />
    );
  } else if (app.status === "needs_info") {
    copy = n.waitingDocs;
    actions = nudgeButton;
  }

  return (
    <Card tone="alt" className="gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-brand">{admin.detail.nextStep}</p>
        <h2 className="text-xl">{copy.title}</h2>
        <p className="max-w-prose text-base text-ink-quiet">{copy.body}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{actions}</div>}
    </Card>
  );
}

function Documents({ app }: { app: Application }) {
  return (
    <ul className="flex flex-col gap-4">
      {app.documents.map((doc) => {
        const name = flow.documents[doc.type];
        const isImage = doc.fileUrl && !doc.fileName?.toLowerCase().endsWith(".pdf");
        return (
          <li key={doc.id} className="flex flex-col gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-medium text-ink">
                {name}
                {!doc.required && <span className="font-normal text-ink-quiet"> ({kit.optional})</span>}
              </p>
              <StatusBadge tone={docTone[doc.status]} label={admin.docStatus[doc.status]} />
            </div>

            {doc.status === "needed" ? (
              <p className="text-sm text-ink-quiet">{admin.detail.waitingForClient}</p>
            ) : doc.fileUrl ? (
              isImage ? (
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="block rounded-control">
                  {/* eslint-disable-next-line @next/next/no-img-element -- in-memory demo file, not optimisable */}
                  <img src={doc.fileUrl} alt={name} className="max-h-80 w-full rounded-control border border-border bg-surface-alt object-contain" />
                </a>
              ) : (
                <TextLink href={doc.fileUrl} external standalone>
                  <FileText className="size-5" aria-hidden />
                  {admin.detail.openFile}
                </TextLink>
              )
            ) : (
              <div className="flex min-h-touch items-center gap-2 rounded-control border border-dashed border-border bg-surface-alt px-3 py-2 text-sm text-ink-quiet">
                <FileText className="size-5 shrink-0" aria-hidden />
                {admin.detail.sampleFile}
              </div>
            )}

            {doc.status === "rejected" && doc.rejectionReason && (
              <p className="text-sm text-danger">{doc.rejectionReason}</p>
            )}

            {doc.status === "uploaded" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <ActionButton
                  action={verifyAction}
                  fields={{ ref: app.ref, documentId: doc.id }}
                  label={admin.actions.markVerified}
                  icon={<CircleCheck aria-hidden />}
                />
                <ReuploadDialog refValue={app.ref} documentId={doc.id} documentName={flow.documentsInline[doc.type]} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function answers(app: Application, name?: string, phone?: string) {
  const d = app.details;
  const f = flow.confirm.fields;
  const l = admin.answerLabels;
  const cover = flow.cover.options.find((option) => option.value === d.coverType)?.label;
  // Motor has bespoke screens; other products describe their own answers.
  const productRows =
    app.product === "motor"
      ? [
          { label: f.plate, value: d.plate },
          { label: f.make, value: d.make },
          { label: f.model, value: d.model },
          { label: f.year, value: d.year },
          { label: f.chassisNumber, value: d.chassisNumber },
          { label: f.bodyType, value: d.bodyType },
          { label: f.ownerName, value: d.ownerName },
          { label: l.coverType, value: cover },
          { label: l.vehicleValueKes, value: d.vehicleValueKes ? formatKes(Number(d.vehicleValueKes)) : undefined },
        ]
      : answerRows(flows[app.product].filter(isQuestionScreen) as QuestionScreenId[], d);
  const rows = [
    { label: l.product, value: productNames[app.product] },
    { label: l.name, value: name },
    { label: l.phone, value: phone ? formatKenyanPhone(phone) : undefined },
    ...productRows,
    { label: l.submitted, value: app.submittedAt ? formatDateTime(app.submittedAt) : undefined },
    { label: l.started, value: formatDateTime(app.createdAt) },
  ];
  return rows.map((row) => ({ label: row.label, value: row.value || flow.review.notProvided }));
}

function QuotesSummary({ quotes }: { quotes: Quote[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-sans text-base font-semibold">{admin.detail.quotes}</h3>
      {quotes.length === 0 ? (
        <p className="text-sm text-ink-quiet">{admin.detail.noQuotes}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {quotes.map((quote) => (
            <li key={quote.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-base text-ink">{quote.insurer}</span>
              <span className="flex items-center gap-2 text-base font-medium text-ink">
                {formatKes(quote.premiumKes)}
                {quote.chosen && <CircleCheck className="size-5 text-success" aria-label={admin.detail.chosen} />}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Messages({ messages }: { messages: Message[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-sans text-base font-semibold">{admin.detail.messages}</h3>
      {messages.length === 0 ? (
        <p className="text-sm text-ink-quiet">{admin.detail.noMessages}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((message) => (
            <li
              key={message.id}
              className={
                message.direction === "in"
                  ? "flex flex-col gap-1 rounded-card bg-surface-alt p-3"
                  : "flex flex-col gap-1 rounded-card border border-border p-3"
              }
            >
              <span className="text-xs text-ink-quiet">
                {message.direction === "in" ? admin.detail.fromClient : admin.detail.fromUs} · {formatDateTime(message.createdAt)}
              </span>
              <span className="text-sm text-ink">{message.body}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
