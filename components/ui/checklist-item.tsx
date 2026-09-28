import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Hourglass,
  type LucideIcon,
  Upload,
} from "lucide-react";
import { kit } from "@/lib/copy";
import type { DocumentStatus } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ChecklistItemProps = {
  title: string;
  description?: string;
  status: DocumentStatus;
  /** Why it was rejected, in plain words: "The photo is blurry." */
  reason?: string;
  /** Shown when status is "needed" or "rejected". */
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  /** "primary" when this is the main thing to do on the page. */
  actionVariant?: "primary" | "secondary";
  className?: string;
};

const statusStyle: Record<DocumentStatus, { icon: LucideIcon; iconClass: string }> = {
  needed: { icon: CircleDashed, iconClass: "text-warn" },
  uploaded: { icon: Hourglass, iconClass: "text-brand" },
  verified: { icon: CircleCheck, iconClass: "text-success" },
  rejected: { icon: CircleAlert, iconClass: "text-danger" },
};

/** One document the client owes (or has sent), with its upload action. */
function ChecklistItem({
  title,
  description,
  status,
  reason,
  actionLabel,
  onAction,
  actionLoading,
  actionVariant = "secondary",
  className,
}: ChecklistItemProps) {
  const { icon: Icon, iconClass } = statusStyle[status];
  const needsAction = status === "needed" || status === "rejected";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-card border bg-surface p-4 sm:flex-row sm:items-center",
        status === "rejected" ? "border-danger" : "border-border",
        className,
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        <Icon className={cn("size-6 shrink-0", iconClass)} aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-ink">{title}</p>
          <p className="text-sm text-ink-quiet">
            {kit.checklist[status]}
            {description && <> · {description}</>}
          </p>
          {status === "rejected" && reason && <p className="text-sm text-danger">{reason}</p>}
        </div>
      </div>
      {needsAction && actionLabel && onAction && (
        <Button
          variant={actionVariant}
          onClick={onAction}
          loading={actionLoading}
          className="w-full sm:w-auto"
        >
          {!actionLoading && <Upload aria-hidden />}
          {actionLabel}
        </Button>
      )}
    </li>
  );
}

export { ChecklistItem };
export type { ChecklistItemProps };
