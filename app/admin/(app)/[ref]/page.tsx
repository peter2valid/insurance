import Link from "next/link";
import { CircleCheck, FileText, Mail, MessageCircle, Phone, SearchX, Send, ShieldCheck } from "lucide-react";
import { quotesReadyAction, sendQuotesAction, verifyAction, verifyAllAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { AdminDetail, AnswerList } from "@/components/admin/admin-detail";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { IssueCoverDialog } from "@/components/admin/issue-cover-dialog";
import { NudgeButton } from "@/components/admin/nudge-button";
import { QuoteDialog } from "@/components/admin/quote-dialog";
import { RecordPaymentDialog } from "@/components/admin/record-payment-dialog";
import { ReuploadDialog } from "@/components/admin/reupload-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { nudgeText } from "@/lib/admin/workflow";
import { admin, coverLabels, flow, kit, periodLabels, productNames, statusPage, vehicleCategoryLabels } from "@/lib/copy";
import { needsSeats, offersMonthly } from "@/lib/data/motor";
import { getQuoteProvider } from "@/lib/data/quote-provider";
import { getRepo } from "@/lib/data/repo";
import type { Agent, Application, Client, DocumentItem, Message, Payment, Quote } from "@/lib/data/types";
import { answerRows, isQuestionScreen, type QuestionScreenId } from "@/lib/flow/questions";
import { flows } from "@/lib/flow/screens";
import { formatDate, formatDateTime, todayIso } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { formatKenyanPhone } from "@/lib/format/phone";
import { twilioConfigured } from "@/lib/notify/twilio";
import { isSampleNumber, whatsappUrlTo } from "@/lib/whatsapp";

const docTone: Record<DocumentItem["status"], BadgeTone> = {
  needed: "neutral",
  uploaded: "new",
  verified: "success",
  rejected: "danger",
};

export async function generateMetadata(props: PageProps<"/admin/[ref]">) {
  const { ref } = await props.params;
  return { title: ref };
}

/**
 * Admin detail (CLAUDE.md §8.3): documents on the left, answers on the
 * right, so they can be checked against each other; quotes, payment and
 * cover beneath. Every action updates the client's page at once.
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
            <Link href="/admin/applications">{admin.backToBoard}</Link>
          </Button>
        }
      />
    );
  }

  const [client, quotes, messages, payments, agent] = await Promise.all([
    repo.getClient(app.clientId),
    repo.listQuotes(ref),
    repo.listMessages(ref),
    repo.listPayments(ref),
    app.agentId ? repo.getAgent(app.agentId) : Promise.resolve(null),
  ]);
  // Opening the application counts as reading the client's replies.
  if (messages.some((message) => message.direction === "in" && !message.read)) await repo.markMessagesRead(ref);

  const suggestions = await getQuoteProvider().suggest(app);
  const suggestion = suggestions[quotes.length % suggestions.length];

  return (
    <AdminDetail
      backHref="/admin/applications"
      name={client?.name || admin.noName}
      reference={app.ref}
      badges={
        <>
          {app.submittedAt && <AdminStatusBadge status={app.status} />}
          {app.details.renewalOf && <StatusBadge tone="neutral" label={admin.notes.renewal} />}
        </>
      }
      actions={client ? <Contact client={client} /> : undefined}
      nextStep={<NextStep app={app} client={client} quotes={quotes} suggestion={suggestion} />}
      documents={<Documents app={app} />}
      answers={<AnswerList items={answers(app, client, agent)} />}
      below={
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="gap-4">
            <h2 className="font-sans text-lg font-semibold">{admin.detail.quotes}</h2>
            <QuotesTable quotes={quotes} />
          </Card>
          <div className="flex flex-col gap-6">
            <Card className="gap-4">
              <h2 className="font-sans text-lg font-semibold">{app.policy ? admin.detail.cover : admin.detail.payments}</h2>
              <PaymentAndCover app={app} payments={payments} />
            </Card>
            <Card className="gap-4">
              <h2 className="font-sans text-lg font-semibold">{admin.detail.messages}</h2>
              <Messages messages={messages} />
            </Card>
          </div>
        </div>
      }
    />
  );
}

function Contact({ client }: { client: Client }) {
  const sample = isSampleNumber(client.phone);
  return (
    <>
      <Button asChild variant="secondary">
        <a href={`tel:${client.phone}`}>
          <Phone aria-hidden />
          {formatKenyanPhone(client.phone)}
        </a>
      </Button>
      {!sample && (
        <Button asChild variant="secondary" size="icon" aria-label={admin.whatsapp.sendFromOutbox}>
          <a href={whatsappUrlTo(client.phone)} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden />
          </a>
        </Button>
      )}
      {client.email && (
        <Button asChild variant="secondary" size="icon" aria-label={client.email}>
          <a href={`mailto:${client.email}`}>
            <Mail aria-hidden />
          </a>
        </Button>
      )}
    </>
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
  const verifyAll = (
    <ActionButton action={verifyAllAction} fields={{ ref: app.ref }} label={admin.actions.verifyAll} icon={<CircleCheck aria-hidden />} variant="primary" />
  );

  let copy: { title: string; body: string } = n.covered;
  let actions: React.ReactNode = null;

  if (!app.submittedAt) {
    copy = n.draft;
    actions = nudgeButton;
  } else if (app.status === "paid") {
    if (toCheck || owed) {
      copy = n.issueDocs;
      actions = toCheck ? verifyAll : nudgeButton;
    } else {
      copy = n.issue;
      actions = <IssueCoverDialog refValue={app.ref} today={todayIso()} />;
    }
  } else if (app.status === "cover_chosen") {
    copy = n.awaitingPayment;
    actions = (
      <>
        <RecordPaymentDialog refValue={app.ref} variant="primary" />
        {nudgeButton}
      </>
    );
  } else if (toCheck) {
    copy = n.check;
    actions = verifyAll;
  } else if (app.status === "quotes_ready") {
    copy = n.waitingChoice;
    actions = nudgeButton;
  } else if (owed && app.status !== "covered") {
    copy = n.waitingDocs;
    actions = nudgeButton;
  } else if (["documents_checked", "preparing_quotes", "received"].includes(app.status)) {
    copy = quotes.length > 0 ? n.quotesReady : n.addQuotes;
    actions =
      quotes.length > 0 ? (
        <>
          <ActionButton action={quotesReadyAction} fields={{ ref: app.ref }} label={admin.actions.markQuotesReady} variant="primary" />
          <QuoteDialog refValue={app.ref} product={app.product} suggestion={suggestion} variant="secondary" />
        </>
      ) : (
        <>
          <ActionButton action={sendQuotesAction} fields={{ ref: app.ref }} label={admin.actions.sendQuotes} icon={<Send aria-hidden />} variant="primary" />
          <QuoteDialog refValue={app.ref} product={app.product} suggestion={suggestion} variant="ghost" label={admin.actions.addQuoteManually} />
        </>
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
                  {/* eslint-disable-next-line @next/next/no-img-element -- private uploaded file, not optimisable */}
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

            {doc.status === "rejected" && doc.rejectionReason && <p className="text-sm text-danger">{doc.rejectionReason}</p>}

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

function answers(app: Application, client: Client | null, agent: Agent | null) {
  const d = app.details;
  const f = flow.confirm.fields;
  const l = admin.answerLabels;
  // Motor has bespoke screens; other products describe their own answers.
  const productRows =
    app.product === "motor"
      ? [
          { label: l.category, value: vehicleCategoryLabels[d.category] },
          ...(needsSeats(d.category) ? [{ label: l.seats, value: d.seats }] : []),
          { label: f.plate, value: d.plate },
          { label: f.make, value: [d.make, d.model].filter(Boolean).join(" ") || undefined },
          { label: f.year, value: d.year },
          { label: f.chassisNumber, value: d.chassisNumber },
          { label: f.bodyType, value: d.bodyType },
          { label: f.ownerName, value: d.ownerName },
          { label: l.coverType, value: d.coverType ? coverLabels[d.coverType] : undefined },
          ...(offersMonthly(d.category) ? [{ label: l.period, value: periodLabels[d.period] ?? periodLabels.annual }] : []),
          ...(d.vehicleValueKes ? [{ label: l.vehicleValueKes, value: formatKes(Number(d.vehicleValueKes)) }] : []),
        ]
      : answerRows(flows[app.product].filter(isQuestionScreen) as QuestionScreenId[], d);
  const rows = [
    { label: l.product, value: productNames[app.product] },
    { label: l.name, value: client?.name },
    { label: l.phone, value: client?.phone ? formatKenyanPhone(client.phone) : undefined },
    { label: l.email, value: client?.email },
    ...productRows,
    ...(agent ? [{ label: l.agent, value: `${agent.name} (${agent.code})` }] : []),
    ...(d.renewalOf ? [{ label: l.renewalOf, value: d.renewalOf }] : []),
    { label: l.submitted, value: app.submittedAt ? formatDateTime(app.submittedAt) : undefined },
    { label: l.started, value: formatDateTime(app.createdAt) },
  ];
  return rows.map((row) => ({ label: row.label, value: row.value || flow.review.notProvided }));
}

function QuotesTable({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return <p className="text-sm text-ink-quiet">{admin.detail.noQuotes}</p>;
  const sorted = [...quotes].sort((a, b) => a.premiumKes - b.premiumKes);
  return (
    <ul className="flex flex-col divide-y divide-border">
      {sorted.map((quote) => (
        <li key={quote.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-base font-medium text-ink">
              {quote.insurer}
              {quote.chosen && <StatusBadge tone="success" label={admin.detail.chosen} icon={CircleCheck} />}
            </span>
            <span className="text-sm text-ink-quiet">
              {coverLabels[quote.coverType] ?? quote.coverType}
              {quote.period === "monthly" ? ` · ${periodLabels.monthly}` : ""}
              {quote.excessKes ? ` · ${statusPage.quotes.excess(formatKes(quote.excessKes))}` : ""}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-base font-semibold text-ink tabular-nums">{formatKes(quote.premiumKes)}</span>
            {quote.breakdown && (
              <span className="text-xs text-ink-quiet tabular-nums">
                {statusPage.quotes.breakdown(
                  formatKes(quote.breakdown.basicKes),
                  formatKes(quote.breakdown.trainingLevyKes + quote.breakdown.phcfKes + quote.breakdown.stampDutyKes),
                )}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PaymentAndCover({ app, payments }: { app: Application; payments: Payment[] }) {
  const paid = payments.find((payment) => payment.status === "paid");
  const pending = payments.filter((payment) => payment.status === "pending").at(-1);
  const p = statusPage.policy;
  return (
    <div className="flex flex-col gap-4">
      {app.policy && (
        <AnswerList
          items={[
            { label: p.insurer, value: app.policy.insurer },
            { label: p.cover, value: coverLabels[app.policy.coverType] ?? app.policy.coverType },
            { label: p.policyNumber, value: app.policy.policyNumber },
            ...(app.policy.certificateNumber ? [{ label: p.certificate, value: app.policy.certificateNumber }] : []),
            { label: p.period, value: `${formatDate(app.policy.startsAt)} – ${formatDate(app.policy.endsAt)}` },
          ]}
        />
      )}
      {paid ? (
        <p className="flex items-center gap-2 text-base text-ink">
          <ShieldCheck className="size-5 text-success" aria-hidden />
          {formatKes(paid.amountKes)} · {statusPage.pay.receipt(paid.receipt ?? "")} · {formatDateTime(paid.paidAt ?? paid.createdAt)}
        </p>
      ) : pending ? (
        <p className="text-base text-ink">
          {admin.payments.status.pending}: {formatKes(pending.amountKes)} · {formatKenyanPhone(pending.phone)} · {formatDateTime(pending.createdAt)}
        </p>
      ) : (
        !app.policy && <p className="text-sm text-ink-quiet">{admin.detail.noPayment}</p>
      )}
    </div>
  );
}

function Messages({ messages }: { messages: Message[] }) {
  if (messages.length === 0) return <p className="text-sm text-ink-quiet">{admin.detail.noMessages}</p>;
  return (
    <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
      {[...messages].reverse().map((message) => (
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
          <span className="text-sm whitespace-pre-line text-ink">{message.body}</span>
        </li>
      ))}
    </ul>
  );
}
