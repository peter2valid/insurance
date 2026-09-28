import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  /** Always say what to do next. */
  body: string;
  action?: React.ReactNode;
  className?: string;
};

function EmptyState({ icon: Icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-card border border-dashed border-border bg-surface p-6",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-alt text-brand">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-heading text-lg font-semibold text-ink">{title}</p>
        <p className="max-w-prose text-base text-ink-quiet">{body}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

export { EmptyState };
