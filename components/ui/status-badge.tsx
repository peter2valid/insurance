import * as React from "react";
import { cva } from "class-variance-authority";
import { CircleAlert, CircleCheck, CircleX, Clock, FileCheck, Hourglass, Inbox, ShieldCheck, Sparkles, Wallet, type LucideIcon } from "lucide-react";
import { statusLabels } from "@/lib/copy";
import type { ApplicationStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/*
 * Colour is never the only signal (CLAUDE.md §4.1): every badge has a text
 * label and an icon. Text stays in ink so it passes AA on every tint.
 */
const badgeVariants = cva(
  "inline-flex h-7 items-center gap-1 rounded-full border px-3 text-sm font-medium whitespace-nowrap text-ink",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-alt [&_svg]:text-ink-quiet",
        info: "border-brand/30 bg-brand/10 [&_svg]:text-brand",
        action: "border-transparent bg-brand text-on-brand",
        warn: "border-warn/40 bg-warn/10 [&_svg]:text-warn",
        success: "border-success/40 bg-success/10 [&_svg]:text-success",
        danger: "border-danger/40 bg-danger/10 [&_svg]:text-danger",
        new: "border-accent/50 bg-accent/15 [&_svg]:text-accent",
      },
    },
  },
);

type BadgeTone = "neutral" | "info" | "action" | "warn" | "success" | "danger" | "new";

const toneIcon: Record<BadgeTone, LucideIcon> = {
  neutral: Clock,
  info: Clock,
  action: CircleAlert,
  warn: CircleAlert,
  success: CircleCheck,
  danger: CircleX,
  new: Sparkles,
};

const statusStyle: Record<ApplicationStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  received: { tone: "info", icon: Inbox },
  documents_checked: { tone: "info", icon: FileCheck },
  preparing_quotes: { tone: "info", icon: Hourglass },
  needs_info: { tone: "warn", icon: CircleAlert },
  quotes_ready: { tone: "action", icon: CircleAlert },
  cover_chosen: { tone: "action", icon: Wallet },
  paid: { tone: "info", icon: Hourglass },
  covered: { tone: "success", icon: ShieldCheck },
};

type StatusBadgeProps =
  | { status: ApplicationStatus; tone?: never; label?: never; icon?: never; className?: string }
  | { status?: never; tone: BadgeTone; label: string; icon?: LucideIcon; className?: string };

/**
 * `<StatusBadge status="needs_info" />` for an application's status, or
 * `<StatusBadge tone="warn" label="Stalled" />` for anything else.
 */
function StatusBadge(props: StatusBadgeProps) {
  const { tone, label, Icon } = props.status
    ? {
        tone: statusStyle[props.status].tone,
        label: statusLabels[props.status],
        Icon: statusStyle[props.status].icon,
      }
    : { tone: props.tone, label: props.label, Icon: props.icon ?? toneIcon[props.tone] };

  return (
    <span data-slot="status-badge" className={cn(badgeVariants({ tone }), props.className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export { StatusBadge };
export type { StatusBadgeProps, BadgeTone };
