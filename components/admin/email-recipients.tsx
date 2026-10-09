import { Mail, Users, UserRound, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";

/** Who receives which email, and where emails come from — at a glance. */
export function EmailRecipients({ from, adminEmail }: { from?: string; adminEmail?: string }) {
  const copy = admin.emails;
  const groups = [
    { icon: Users, title: copy.clients, events: copy.clientEvents },
    { icon: UserRound, title: adminEmail ? copy.you(adminEmail) : copy.youMissing, events: copy.youEvents },
    { icon: Briefcase, title: copy.agents, events: copy.agentEvents },
  ];
  return (
    <Card className="gap-4">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-sm font-medium text-ink">
          <Mail className="size-4 text-brand" aria-hidden />
          {from ? copy.from(from) : copy.notSending}
        </p>
        {from && adminEmail && <p className="text-sm text-ink-quiet">{copy.replyTo(adminEmail)}</p>}
      </div>
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="flex flex-col gap-1">
            <p className="flex items-center gap-2 text-base font-medium text-ink">
              <Icon className="size-4 text-ink-quiet" aria-hidden />
              {group.title}
            </p>
            <ul className="flex flex-col gap-1 pl-6 text-sm text-ink-quiet">
              {group.events.map((event) => (
                <li key={event}>{event}</li>
              ))}
            </ul>
          </div>
        );
      })}
      <TextLink href="/admin/email-preview" external standalone className="self-start text-sm">
        {copy.preview}
      </TextLink>
    </Card>
  );
}
