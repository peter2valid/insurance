import { CircleAlert, FileCheck, Hourglass, Inbox, Send, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { admin } from "@/lib/copy";
import type { ApplicationStatus } from "@/lib/data/types";

const style: Record<ApplicationStatus, { tone: BadgeTone; icon: LucideIcon }> = {
  received: { tone: "info", icon: Inbox },
  documents_checked: { tone: "info", icon: FileCheck },
  preparing_quotes: { tone: "info", icon: Hourglass },
  needs_info: { tone: "warn", icon: CircleAlert },
  quotes_ready: { tone: "info", icon: Send },
  cover_chosen: { tone: "action", icon: Wallet },
  paid: { tone: "success", icon: Wallet },
  covered: { tone: "success", icon: ShieldCheck },
};

/** Application status in the broker's words, built on the kit StatusBadge. */
export function AdminStatusBadge({ status }: { status: ApplicationStatus }) {
  const { tone, icon } = style[status];
  return <StatusBadge tone={tone} label={admin.statusLabels[status]} icon={icon} />;
}
