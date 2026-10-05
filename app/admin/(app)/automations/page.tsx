import { CircleCheck, CircleDashed, Mail, MessageCircle } from "lucide-react";
import { AutomationSettings } from "@/components/admin/automation-settings";
import { PageHeader, Section } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";
import { formatAgo, requestTime } from "@/lib/format/date";
import { emailConfigured, missingEmailVars } from "@/lib/notify/email";
import { missingTwilioVars, twilioConfigured } from "@/lib/notify/twilio";

export const metadata = { title: admin.nav.automations };

/** What runs by itself, where messages go, and what ran recently. */
export default async function AutomationsPage() {
  const now = requestTime();
  const repo = getRepo();
  const [settings, runs] = await Promise.all([repo.getSettings(), repo.listAutomationRuns(200)]);
  const copy = admin.automations;
  // One line per rule and application (skipped earlier reminders are recorded too).
  const seen = new Set<string>();
  const recent = runs
    .filter((run) => run.rule !== "tick")
    .filter((run) => {
      const id = `${run.rule}:${run.applicationRef ?? run.key}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 15);
  const channels = [
    { name: copy.whatsapp, icon: MessageCircle, on: twilioConfigured(), missing: missingTwilioVars() },
    { name: copy.email, icon: Mail, on: emailConfigured(), missing: missingEmailVars() },
  ];

  return (
    <>
      <PageHeader title={copy.heading} description={copy.intro} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AutomationSettings settings={settings} />
        </div>
        <div className="flex flex-col gap-6">
          <Section title={copy.channels}>
            <Card className="gap-0 p-0 sm:p-0">
              <ul className="flex flex-col divide-y divide-border">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <li key={channel.name} className="flex items-start gap-3 p-4">
                      <Icon className="mt-1 size-5 shrink-0 text-ink-quiet" aria-hidden />
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-medium text-ink">{channel.name}</span>
                        <span className="flex items-center gap-1 text-sm text-ink">
                          {channel.on ? (
                            <CircleCheck className="size-4 text-success" aria-hidden />
                          ) : (
                            <CircleDashed className="size-4 text-ink-quiet" aria-hidden />
                          )}
                          {channel.on ? copy.channelOn : copy.channelOff}
                        </span>
                        {!channel.on && <span className="text-xs text-ink-quiet">{copy.channelMissing(channel.missing.join(", "))}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Section>
          <Section
            title={copy.recent}
            action={
              <TextLink href="/admin/outbox" standalone className="text-sm">
                {admin.today.activityAll}
              </TextLink>
            }
          >
            <Card className="gap-0 p-0 sm:p-0">
              {recent.length === 0 ? (
                <p className="p-4 text-sm text-ink-quiet">{copy.noRuns}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {recent.map((run) => (
                    <li key={run.key} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="text-ink">
                        {copy.ruleNames[run.rule] ?? run.rule}
                        {run.applicationRef && (
                          <>
                            {" · "}
                            <TextLink href={`/admin/${run.applicationRef}`}>{run.applicationRef}</TextLink>
                          </>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-ink-quiet">{formatAgo(run.createdAt, now)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Section>
        </div>
      </div>
    </>
  );
}
