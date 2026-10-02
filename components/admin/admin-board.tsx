import * as React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/*
 * AdminBoard template (CLAUDE.md §6, §8.3): the admin home is four to-do
 * lists, not a table. One list at a time (tabs) keeps it calm on a laptop
 * and usable on a phone; "Needs me now" opens first. Each row carries the
 * one action that moves it forward.
 */

type Bucket = {
  id: string;
  title: string;
  items: { key: string; node: React.ReactNode }[];
  /** Shown when the list is empty; says what will appear here. */
  empty: React.ReactNode;
  /** The "Needs me now" list: its count is highlighted when non-zero. */
  urgent?: boolean;
};

type AdminBoardProps = {
  heading: string;
  summary?: string;
  buckets: Bucket[];
};

function Count({ value, urgent }: { value: number; urgent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-sm font-medium",
        urgent && value > 0 ? "bg-brand text-on-brand" : "bg-surface-alt text-ink-quiet",
      )}
    >
      {value}
    </span>
  );
}

export function AdminBoard({ heading, summary, buckets }: AdminBoardProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">{heading}</h1>
        {summary && <p className="max-w-prose text-lg text-ink-quiet">{summary}</p>}
      </div>

      <Tabs defaultValue={buckets[0]?.id} className="flex flex-col gap-4">
        <TabsList>
          {buckets.map((bucket) => (
            <TabsTrigger key={bucket.id} value={bucket.id}>
              {bucket.title}
              <Count value={bucket.items.length} urgent={bucket.urgent} />
            </TabsTrigger>
          ))}
        </TabsList>

        {buckets.map((bucket) => (
          <TabsContent key={bucket.id} value={bucket.id} className="pt-0">
            <h2 className="sr-only">{bucket.title}</h2>
            {bucket.items.length > 0 ? (
              <Card className="gap-0 overflow-hidden p-0 sm:p-0">
                <ul className="flex flex-col divide-y divide-border">
                  {bucket.items.map((item) => (
                    <li key={item.key}>{item.node}</li>
                  ))}
                </ul>
              </Card>
            ) : (
              bucket.empty
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export function AdminBoardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton shape="line" className="h-8 w-40" />
        <Skeleton shape="line" className="w-2/3" />
      </div>
      <Skeleton shape="line" className="h-11 w-full" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}
