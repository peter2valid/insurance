import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/*
 * AdminBoard template (CLAUDE.md §6, §8.3): the admin home is four to-do
 * lists, not a table. Phones stack them ("Needs me now" first, so the top
 * of the screen is always the next job); wide screens show four columns.
 */

type Bucket = {
  id: string;
  title: string;
  items: React.ReactNode[];
  /** Shown when the list is empty; says what will appear here. */
  empty: React.ReactNode;
  /** The "Needs me now" list: its count is highlighted when non-zero. */
  urgent?: boolean;
};

type AdminBoardProps = {
  heading: string;
  intro?: string;
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

export function AdminBoard({ heading, intro, buckets }: AdminBoardProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl">{heading}</h1>
        {intro && <p className="max-w-prose text-base text-ink-quiet">{intro}</p>}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-4">
        {buckets.map((bucket) => (
          <section
            key={bucket.id}
            aria-labelledby={`${bucket.id}-heading`}
            className="flex flex-col gap-3"
          >
            <h2
              id={`${bucket.id}-heading`}
              className="flex items-center gap-2 font-sans text-base font-semibold"
            >
              {bucket.title}
              <Count value={bucket.items.length} urgent={bucket.urgent} />
            </h2>
            {bucket.items.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {bucket.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              bucket.empty
            )}
          </section>
        ))}
      </div>
    </>
  );
}

export function AdminBoardSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton shape="line" className="h-8 w-40" />
        <Skeleton shape="line" className="w-2/3" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton shape="line" className="w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
