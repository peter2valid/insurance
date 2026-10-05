import Link from "next/link";
import { ArrowRight, ChevronRight, Mail, MessageCircle, Smartphone } from "lucide-react";
import { BoardCard } from "@/components/admin/board-card";
import { PageHeader, Section } from "@/components/admin/page-header";
import { ResetDemo } from "@/components/admin/reset-demo";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { admin, notifyLabels } from "@/lib/copy";
import { getBoard, getDashboard } from "@/lib/data/queries";
import { getRepo } from "@/lib/data/repo";
import { formatAgo, nairobiHour, requestTime } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { getNotifier } from "@/lib/notify";
import { cn } from "@/lib/utils";

export const metadata = { title: admin.nav.today };

const channelIcon = { whatsapp: MessageCircle, email: Mail, sms: Smartphone };

/**
 * Admin home: what needs the broker now (one action per row), this
 * month's money, the pipeline by stage, and the latest messages.
 */
export default async function TodayPage() {
  const now = requestTime();
  const [board, dash, outbox, settings] = await Promise.all([
    getBoard(now),
    getDashboard(now),
    getNotifier().listOutbox(),
    getRepo().getSettings(),
  ]);
  const t = admin.today;
  const hour = nairobiHour(now);
  const greeting = hour < 12 ? t.greetings.morning : hour < 17 ? t.greetings.afternoon : t.greetings.evening;
  const queue = board.needs_me.slice(0, 6);
  const automationsOn = [settings.autoQuote, settings.nudgeStalled, settings.remindQuotes, settings.remindPayment, settings.renewalReminders].filter(Boolean).length;

  const ledger = [
    { label: t.ledger.collected, value: formatKes(dash.collectedKes), note: t.ledger.collectedNote(dash.collectedCount), href: "/admin/payments" },
    { label: t.ledger.awaiting, value: formatKes(dash.awaitingKes), note: t.ledger.awaitingNote(dash.awaitingCount), href: "/admin/applications" },
    { label: t.ledger.commission, value: formatKes(dash.commissionOwedKes), note: t.ledger.commissionNote(dash.commissionOwedCount), href: "/admin/agents" },
    { label: t.ledger.renewals, value: String(dash.renewalsCount), note: t.ledger.renewalsNote, href: "/admin/renewals" },
  ];

  const p = dash.pipeline;
  const stages = [
    { label: t.pipeline.applying, value: p.applying },
    { label: t.pipeline.new, value: p.new },
    { label: t.pipeline.quotes, value: p.quotes },
    { label: t.pipeline.payment, value: p.payment },
    { label: t.pipeline.issue, value: p.issue, urgent: true },
    { label: t.pipeline.covered, value: p.covered },
  ];

  return (
    <>
      <PageHeader title={t.heading(greeting)} description={t.summary(board.needs_me.length)} />

      <Section
        title={t.needsYou}
        action={
          <TextLink href="/admin/applications" standalone className="text-sm">
            {t.seeAll}
            <ArrowRight className="size-4" aria-hidden />
          </TextLink>
        }
      >
        {queue.length > 0 ? (
          <Card className="gap-0 overflow-hidden p-0 sm:p-0">
            <ul className="flex flex-col divide-y divide-border">
              {queue.map((item) => (
                <li key={item.application.ref}>
                  <BoardCard item={item} now={now} from="today" />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card tone="alt">
            <p className="text-base text-ink-quiet">{t.allClear}</p>
          </Card>
        )}
      </Section>

      <Section title={t.ledgerHeading}>
        <Card className="grid grid-cols-1 gap-0 divide-y divide-border p-0 sm:grid-cols-2 sm:divide-y-0 sm:p-0 lg:grid-cols-4">
          {ledger.map((entry, index) => (
            <Link
              key={entry.label}
              href={entry.href}
              className={cn(
                "flex flex-col gap-1 p-4 transition-colors hover:bg-surface-alt sm:p-6",
                index % 2 === 1 && "sm:border-l sm:border-border",
                index >= 2 && "sm:border-t sm:border-border lg:border-t-0",
                index >= 1 && "lg:border-l lg:border-border",
              )}
            >
              <span className="text-sm text-ink-quiet">{entry.label}</span>
              <span className="font-heading text-2xl font-semibold text-ink tabular-nums">{entry.value}</span>
              <span className="text-xs text-ink-quiet">{entry.note}</span>
            </Link>
          ))}
        </Card>
      </Section>

      <Section title={t.pipelineHeading} description={t.pipelineNote}>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage, index) => (
            <li
              key={stage.label}
              className={cn(
                "relative flex flex-col gap-1 rounded-control border p-3",
                stage.urgent && stage.value > 0 ? "border-brand bg-surface" : "border-border bg-surface",
              )}
            >
              <span className={cn("font-heading text-2xl font-semibold tabular-nums", stage.urgent && stage.value > 0 ? "text-brand" : "text-ink")}>
                {stage.value}
              </span>
              <span className="text-sm text-ink-quiet">{stage.label}</span>
              {index < stages.length - 1 && (
                <ChevronRight className="absolute top-1/2 -right-3 z-10 hidden size-4 -translate-y-1/2 text-ink-quiet lg:block" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section
            title={t.activityHeading}
            action={
              <TextLink href="/admin/outbox" standalone className="text-sm">
                {t.activityAll}
              </TextLink>
            }
          >
            <Card className="gap-0 p-0 sm:p-0">
              <ul className="flex flex-col divide-y divide-border">
                {outbox.slice(0, 6).map((item) => {
                  const Icon = channelIcon[item.channel];
                  return (
                    <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                      <Icon className="mt-1 size-4 shrink-0 text-ink-quiet" aria-label={notifyLabels.channels[item.channel]} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="line-clamp-2 text-sm text-ink">{item.body}</p>
                        <p className="text-xs text-ink-quiet">
                          {item.audience === "admin" ? admin.outbox.toAdmin : item.audience === "agent" ? admin.outbox.toAgent : admin.outbox.toClient}
                          {item.applicationRef ? ` · ${item.applicationRef}` : ""} · {formatAgo(item.createdAt, now)}
                        </p>
                      </div>
                      {item.delivery === "sent" && <StatusBadge tone="success" label={admin.outbox.sentShort} />}
                    </li>
                  );
                })}
                {outbox.length === 0 && <li className="px-4 py-3 text-sm text-ink-quiet">{admin.outbox.empty.body}</li>}
              </ul>
            </Card>
          </Section>
        </div>
        <Section title={admin.nav.automations}>
          <Card tone="alt" className="gap-2">
            <p className="text-base font-medium text-ink">{t.automationsOn(automationsOn)}</p>
            <p className="text-sm text-ink-quiet">{admin.automations.runNote}</p>
            <TextLink href="/admin/automations" standalone className="text-sm">
              {t.automationsLink}
            </TextLink>
          </Card>
        </Section>
      </div>

      <ResetDemo />
    </>
  );
}
