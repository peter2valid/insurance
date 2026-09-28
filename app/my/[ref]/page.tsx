import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchX } from "lucide-react";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { LiveRefresh } from "@/components/status/live-refresh";
import { QuoteList } from "@/components/status/quote-list";
import { StatusPage, StatusPageMessage } from "@/components/status/status-page";
import { UploadDialog } from "@/components/status/upload-dialog";
import { Button } from "@/components/ui/button";
import { ChecklistItem } from "@/components/ui/checklist-item";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { flow, statusLabels, statusPage } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";
import { getFlowContext } from "@/lib/flow/context";
import { buildNow, buildTimeline, currentStepLabel } from "@/lib/status/view";

export const metadata: Metadata = { title: statusPage.progress, robots: { index: false } };

/**
 * Client status page (CLAUDE.md §8.2). Answers "what do I do now?" first,
 * then documents, quotes and progress. Stays in sync with admin via
 * LiveRefresh. Only the signed-in owner can see it.
 */
export default async function MyApplicationPage(props: PageProps<"/my/[ref]">) {
  const { ref } = await props.params;
  const ctx = await getFlowContext(ref);

  if (ctx.kind === "signed_out") redirect(`/start/phone?ref=${encodeURIComponent(ref)}`);
  if (ctx.kind === "not_yours") {
    return (
      <StatusPageMessage helpMessage={statusPage.whatsappMessage(ref, statusPage.notFound.title)}>
        <EmptyState
          tone="error"
          icon={SearchX}
          title={statusPage.notFound.title}
          body={statusPage.notFound.body}
          action={
            <Button asChild variant="secondary">
              <Link href="/">{statusPage.notFound.action}</Link>
            </Button>
          }
        />
      </StatusPageMessage>
    );
  }
  // Not sent yet: carry on where they stopped.
  if (ctx.kind === "active") redirect(`/start/resume?ref=${encodeURIComponent(ref)}`);

  const { app } = ctx;
  const quotes = await getRepo().listQuotes(app.ref);
  const now = buildNow(app);
  const message = statusPage.whatsappMessage(app.ref, currentStepLabel(app));
  const car = [app.details.make, app.details.model].filter(Boolean).join(" ");
  const vehicle = [car, app.details.plate].filter(Boolean).join(" · ");

  const documents = app.documents.filter((doc) => doc.required || doc.status !== "needed");
  const showQuotes = quotes.length > 0 && ["quotes_ready", "cover_chosen", "covered"].includes(app.status);

  return (
    <>
      <LiveRefresh refValue={app.ref} watch={app.status} announce={statusPage.updatedToast(statusLabels[app.status])} />
      <StatusPage
        reference={app.ref}
        subtitle={vehicle}
        status={app.status}
        helpMessage={message}
        now={{
          title: now.title,
          body: now.body,
          action:
            now.kind === "upload" ? (
              <UploadDialog
                refValue={app.ref}
                documentType={now.document.type}
                label={now.actionLabel}
                variant="primary"
              />
            ) : undefined,
        }}
        sections={[
          ...(showQuotes
            ? [
                {
                  id: "quotes",
                  title: statusPage.quotesHeading,
                  content: (
                    <QuoteList
                      refValue={app.ref}
                      // After choosing, show only their choice.
                      quotes={app.status === "quotes_ready" ? quotes : quotes.filter((quote) => quote.chosen)}
                      canChoose={app.status === "quotes_ready" && now.kind === "quotes"}
                    />
                  ),
                },
              ]
            : []),
          {
            id: "documents",
            title: statusPage.stillNeeded,
            content: (
              <ul className="flex flex-col gap-3">
                {documents.map((doc) => {
                  const name = flow.documents[doc.type];
                  const isNowAction = now.kind === "upload" && now.document.id === doc.id;
                  return (
                    <ChecklistItem
                      key={doc.id}
                      title={name}
                      status={doc.status}
                      reason={doc.rejectionReason}
                      description={doc.required ? undefined : statusPage.optional}
                      // The "What to do now" card already has this document's button.
                      action={
                        isNowAction ? undefined : (
                          <UploadDialog
                            refValue={app.ref}
                            documentType={doc.type}
                            label={doc.status === "rejected" ? statusPage.documentHints.rejected : statusPage.documentHints.needed}
                          />
                        )
                      }
                    />
                  );
                })}
              </ul>
            ),
          },
          {
            id: "progress",
            title: statusPage.progress,
            content: (
              <div className="flex flex-col gap-4">
                <StatusTimeline items={buildTimeline(app)} />
                <p className="text-sm text-ink-quiet">{statusPage.liveNote}</p>
              </div>
            ),
          },
        ]}
        messageAction={<WhatsAppButton label={statusPage.messageUs} message={message} />}
      />
    </>
  );
}
