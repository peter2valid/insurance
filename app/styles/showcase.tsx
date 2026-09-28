import * as React from "react";
import { cn } from "@/lib/utils";

/* Layout helpers for the /styles page only. */

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-8 flex-col gap-6 border-t border-border pt-8">
      <h3 className="text-xl">{title}</h3>
      {children}
    </section>
  );
}

/** A labelled cell showing one state of a component. */
export function State({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <p className="text-xs text-ink-quiet">{label}</p>
      {children}
    </div>
  );
}

export function StateGrid({
  children,
  columns = 3,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 5;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-2 lg:grid-cols-3",
        columns === 5 && "sm:grid-cols-2 lg:grid-cols-5",
      )}
    >
      {children}
    </div>
  );
}
