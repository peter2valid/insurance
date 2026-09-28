import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  /** Always say what to do next. For errors: what happened and how to fix it. */
  body: string;
  action?: React.ReactNode;
  /** "error" for page-level failures (couldn't load, not found). */
  tone?: "default" | "error";
  /** "compact": one short line, for lists where empty is normal. */
  size?: "default" | "compact";
  className?: string;
};

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "default",
  size = "default",
  className,
}: EmptyStateProps) {
  if (size === "compact") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-card border border-dashed border-border p-4",
          className,
        )}
      >
        <Icon className="size-5 shrink-0 text-ink-quiet" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-sm text-ink-quiet">{body}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-start gap-3 rounded-card border border-dashed bg-surface p-6",
        tone === "error" ? "border-danger" : "border-border",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          tone === "error" ? "bg-danger/10 text-danger" : "bg-surface-alt text-brand",
        )}
      >
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
