import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { StatusPage } from "@/components/status/status-page";
import { Button } from "@/components/ui/button";
import { ChecklistItem } from "@/components/ui/checklist-item";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { statusLabels, statusPage } from "@/lib/copy";

// Stage 3 placeholder content inside the StatusPage template.
// Real data and live sync with admin arrive in Stage 7.
export default async function MyApplicationPage(props: PageProps<"/my/[ref]">) {
  const { ref } = await props.params;
  const copy = statusPage.placeholder;
  const message = statusPage.whatsappMessage(ref, statusLabels.needs_info);

  return (
    <StatusPage
      reference={ref}
      subtitle={copy.vehicle}
      status="needs_info"
      helpMessage={message}
      now={{
        title: copy.nowTitle,
        body: copy.nowBody,
        action: <Button>{copy.upload}</Button>,
      }}
      sections={[
        {
          id: "still-needed",
          title: statusPage.stillNeeded,
          content: (
            <ul className="flex flex-col gap-3">
              <ChecklistItem title={copy.kraPin} status="needed" />
              <ChecklistItem title={copy.logbook} status="verified" />
              <ChecklistItem title={copy.id} status="uploaded" />
            </ul>
          ),
        },
        {
          id: "progress",
          title: statusPage.progress,
          content: (
            <StatusTimeline
              items={[
                { id: "received", label: statusLabels.received, state: "done", meta: copy.receivedMeta },
                { id: "needs_info", label: statusLabels.needs_info, state: "current" },
                { id: "preparing_quotes", label: statusLabels.preparing_quotes, state: "upcoming" },
                { id: "quotes_ready", label: statusLabels.quotes_ready, state: "upcoming" },
                { id: "covered", label: statusLabels.covered, state: "upcoming" },
              ]}
            />
          ),
        },
      ]}
      messageAction={<WhatsAppButton label={statusPage.messageUs} message={message} />}
    />
  );
}
