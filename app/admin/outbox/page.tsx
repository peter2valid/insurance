import type { Metadata } from "next";
import { CircleAlert, CircleCheck, Inbox, Mail, MessageCircle, MessageSquare, Send, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { admin, notifyLabels } from "@/lib/copy";
import type { Channel } from "@/lib/data/types";
import { formatAgo, formatDateTime, requestTime } from "@/lib/format/date";
import { maskPhone } from "@/lib/format/mask";
import { getNotifier } from "@/lib/notify";
import { missingTwilioVars, twilioConfigured } from "@/lib/notify/twilio";
import { testWhatsAppAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { isSampleNumber, whatsappUrlTo } from "@/lib/whatsapp";

export const metadata: Metadata = { title: admin.outbox.heading };

const channelIcon: Record<Channel, LucideIcon> = {
  whatsapp: MessageCircle,
  sms: MessageSquare,
  email: Mail,
};

/**
 * Outbox (CLAUDE.md §8.3): every simulated notification, newest first,
 * so the demo can show "the client was notified". Nothing here was sent.
 */
export default async function OutboxPage() {
  const items = await getNotifier().listOutbox();
  const now = requestTime();
  const copy = admin.outbox;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">{copy.heading}</h1>
        <p className="max-w-prose text-base text-ink-quiet">{copy.intro}</p>
      </div>

      <WhatsAppCheck />

      {items.length === 0 ? (
        <EmptyState icon={Inbox} title={copy.empty.title} body={copy.empty.body} className="max-w-flow" />
      ) : (
        <ul className="flex max-w-flow flex-col gap-3">
          {items.map((item) => {
            const Icon = channelIcon[item.channel];
            const to = item.audience === "admin" ? copy.toAdmin : `${copy.toClient} · ${maskPhone(item.to)}`;
            return (
              <li key={item.id}>
                <Card className="gap-3 p-4 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="size-5 shrink-0 text-brand" aria-hidden />
                    <span className="text-sm font-medium text-ink">{notifyLabels.channels[item.channel]}</span>
                    <span className="text-sm text-ink-quiet">· {to}</span>
                    {item.delivery === "sent" ? (
                      <StatusBadge tone="success" label={copy.sent} className="ml-auto" />
                    ) : item.delivery === "failed" ? (
                      <StatusBadge tone="danger" label={copy.failed} className="ml-auto" />
                    ) : (
                      <StatusBadge tone="neutral" label={copy.simulated} className="ml-auto" />
                    )}
                  </div>
                  <p className="text-base whitespace-pre-line text-ink">{item.body}</p>
                  {item.delivery === "failed" && <p className="text-sm text-danger">{copy.failedHint}</p>}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)} className="text-sm text-ink-quiet">
                      {formatAgo(item.createdAt, now)}
                    </time>
                    <div className="flex flex-wrap items-center gap-x-4">
                      {/* Real applicants: send this exact message from your own WhatsApp. */}
                      {item.audience === "client" && item.channel === "whatsapp" && item.delivery !== "sent" && !isSampleNumber(item.to) && (
                        <TextLink href={whatsappUrlTo(item.to, item.body)} external standalone className="text-sm">
                          {admin.whatsapp.sendFromOutbox}
                        </TextLink>
                      )}
                      {item.applicationRef && (
                        <TextLink href={`/admin/${item.applicationRef}`} standalone className="text-sm">
                          {copy.viewApplication} {item.applicationRef}
                        </TextLink>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** Is real WhatsApp on? Shows what's missing and lets the admin send a test. */
function WhatsAppCheck() {
  const copy = admin.whatsappCheck;
  const on = twilioConfigured();
  return (
    <Card tone="alt" className="max-w-flow gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        {on ? (
          <CircleCheck className="size-6 shrink-0 text-success" aria-hidden />
        ) : (
          <CircleAlert className="size-6 shrink-0 text-warn" aria-hidden />
        )}
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-ink">{on ? copy.on : copy.off}</p>
          <p className="max-w-prose text-sm text-ink-quiet">{on ? copy.onBody : copy.offBody(missingTwilioVars().join(", "))}</p>
        </div>
      </div>
      <ActionButton action={testWhatsAppAction} fields={{}} label={copy.test} icon={<Send aria-hidden />} />
    </Card>
  );
}
