import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";

/*
 * AdminDetail template (CLAUDE.md §8.3): documents on the left, answers on
 * the right, so the two can be checked against each other. Phones switch
 * between them with tabs. Content renders once (force-mounted panels).
 */

type AdminDetailProps = {
  backHref: string;
  name: string;
  reference: string;
  /** Status badge(s) for the application. */
  badges?: React.ReactNode;
  /** One primary action plus secondary ones, e.g. Mark verified / Ask for re-upload. */
  actions?: React.ReactNode;
  /** What the broker should do next, above the two columns. */
  nextStep?: React.ReactNode;
  documents: React.ReactNode;
  answers: React.ReactNode;
  /** Full-width content under the two columns (quotes, payment, messages). */
  below?: React.ReactNode;
};

export function AdminDetail({
  backHref,
  name,
  reference,
  badges,
  actions,
  nextStep,
  documents,
  answers,
  below,
}: AdminDetailProps) {
  const panels = [
    { id: "documents", title: admin.detail.documents, content: documents },
    { id: "answers", title: admin.detail.answers, content: answers },
  ];

  return (
    <>
      <TextLink href={backHref} standalone quiet className="-ml-1 text-sm">
        <ChevronLeft className="size-4" aria-hidden />
        {admin.backToBoard}
      </TextLink>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={name} size="lg" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl">{name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-ink-quiet">{reference}</span>
              {badges}
            </div>
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 md:justify-end">{actions}</div>}
      </div>

      {nextStep}

      <Tabs defaultValue="documents" className="lg:grid lg:grid-cols-2 lg:gap-6">
        <TabsList className="lg:hidden">
          {panels.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id}>
              {panel.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map((panel) => (
          <TabsContent
            key={panel.id}
            value={panel.id}
            forceMount
            className="data-[state=inactive]:hidden lg:pt-0 lg:data-[state=inactive]:block"
          >
            <Card>
              <h2 className="hidden font-sans text-lg font-semibold lg:block">{panel.title}</h2>
              {panel.content}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      {below}
    </>
  );
}

/** Label/value list for form answers. */
export function AnswerList({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
          <dt className="text-sm text-ink-quiet sm:w-40 sm:shrink-0">{item.label}</dt>
          <dd className="text-base text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminDetailSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <Skeleton shape="line" className="w-32" />
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="size-12" />
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" className="h-6 w-48" />
          <Skeleton shape="line" className="w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
