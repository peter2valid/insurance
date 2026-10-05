"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { admin } from "@/lib/copy";
import { cn } from "@/lib/utils";

/*
 * AdminBoard template (CLAUDE.md §6, §8.3): four to-do lists, not a table.
 * One list at a time (tabs) keeps it calm on a laptop and usable on a
 * phone; "Needs me now" opens first. Search narrows every list at once.
 * Each row carries the one action that moves it forward.
 */

type Bucket = {
  id: string;
  title: string;
  /** `search`: lower-case text the search box matches (name, ref, plate…). */
  items: { key: string; node: React.ReactNode; search: string }[];
  /** Shown when the list is empty; says what will appear here. */
  empty: React.ReactNode;
  /** The "Needs me now" list: its count is highlighted when non-zero. */
  urgent?: boolean;
};

type AdminBoardProps = {
  heading?: React.ReactNode;
  buckets: Bucket[];
};

function Count({ value, urgent }: { value: number; urgent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-sm font-medium tabular-nums",
        urgent && value > 0 ? "bg-brand text-on-brand" : "bg-surface-alt text-ink-quiet",
      )}
    >
      {value}
    </span>
  );
}

export function AdminBoard({ heading, buckets }: AdminBoardProps) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();
  const filtered = buckets.map((bucket) => ({
    ...bucket,
    shown: q ? bucket.items.filter((item) => item.search.includes(q)) : bucket.items,
  }));

  return (
    <div className="flex flex-col gap-6">
      {heading}
      <div className="max-w-md">
        <Input
          type="search"
          label={admin.search.label}
          hideLabel
          placeholder={admin.search.placeholder}
          prefix={<Search className="size-5" aria-hidden />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <Tabs defaultValue={buckets[0]?.id} className="flex flex-col gap-4">
        <TabsList>
          {filtered.map((bucket) => (
            <TabsTrigger key={bucket.id} value={bucket.id}>
              {bucket.title}
              <Count value={bucket.shown.length} urgent={bucket.urgent} />
            </TabsTrigger>
          ))}
        </TabsList>

        {filtered.map((bucket) => (
          <TabsContent key={bucket.id} value={bucket.id} className="pt-0">
            <h2 className="sr-only">{bucket.title}</h2>
            {bucket.shown.length > 0 ? (
              <Card className="gap-0 overflow-hidden p-0 sm:p-0">
                <ul className="flex flex-col divide-y divide-border">
                  {bucket.shown.map((item) => (
                    <li key={item.key}>{item.node}</li>
                  ))}
                </ul>
              </Card>
            ) : q ? (
              <Card tone="alt">
                <p className="text-base text-ink-quiet">{admin.search.none(query.trim())}</p>
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
