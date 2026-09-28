import * as React from "react";
import { MinimalHeader } from "@/components/site/minimal-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { flow, statusPage } from "@/lib/copy";
import type { ApplicationStatus } from "@/lib/data/types";

/*
 * StatusPage template (CLAUDE.md §8.2). The page always answers
 * "what do I do now?" first, then shows what's still needed and progress.
 */

function StatusShell({ helpMessage, children }: { helpMessage: string; children: React.ReactNode }) {
  return (
    <>
      <MinimalHeader helpLabel={flow.help} helpMessage={helpMessage} />
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-8 px-4 py-6 md:py-12">
        {children}
      </main>
    </>
  );
}

type StatusSection = { id: string; title: string; content: React.ReactNode };

type StatusPageProps = {
  reference: string;
  /** e.g. "Toyota Fielder · KDA 123A" */
  subtitle?: string;
  status: ApplicationStatus;
  now: {
    title: string;
    body: string;
    /** The one primary action, if the client has something to do. */
    action?: React.ReactNode;
  };
  sections: StatusSection[];
  /** "Message us" WhatsApp button, pre-filled with reference and step. */
  messageAction: React.ReactNode;
  helpMessage: string;
};

export function StatusPage({
  reference,
  subtitle,
  status,
  now,
  sections,
  messageAction,
  helpMessage,
}: StatusPageProps) {
  return (
    <StatusShell helpMessage={helpMessage}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-sm text-ink-quiet">{statusPage.reference(reference)}</p>
          <StatusBadge status={status} />
        </div>
        {subtitle && <p className="text-base text-ink">{subtitle}</p>}
      </div>

      <Card className="border-brand">
        <p id="now-heading" className="text-sm font-medium text-brand">
          {statusPage.nowHeading}
        </p>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl">{now.title}</h1>
          <p className="max-w-prose text-base text-ink-quiet">{now.body}</p>
        </div>
        {now.action && <div className="[&>*]:w-full sm:[&>*]:w-auto">{now.action}</div>}
      </Card>

      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`${section.id}-heading`} className="flex flex-col gap-4">
          <h2 id={`${section.id}-heading`} className="text-xl">
            {section.title}
          </h2>
          {section.content}
        </section>
      ))}

      <Card tone="alt">
        <p className="text-base text-ink">{statusPage.messageUsHint}</p>
        <div className="[&>*]:w-full sm:[&>*]:w-auto">{messageAction}</div>
      </Card>
    </StatusShell>
  );
}

export function StatusPageSkeleton() {
  return (
    <StatusShell helpMessage={flow.help}>
      <div aria-busy="true" className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Skeleton shape="line" className="w-32" />
          <Skeleton shape="line" className="h-7 w-40" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="flex flex-col gap-3">
          <Skeleton shape="line" className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </StatusShell>
  );
}

/** Not found / failed to load, inside the same shell. */
export function StatusPageMessage({ helpMessage, children }: { helpMessage: string; children: React.ReactNode }) {
  return <StatusShell helpMessage={helpMessage}>{children}</StatusShell>;
}
