import * as React from "react";
import { Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";

type ApplicationCardProps = {
  href: string;
  name: string;
  reference: string;
  vehicle: string;
  /** What's happening, in the admin's words: "Stopped at step 3 · 12 min ago". */
  note: string;
  badge?: React.ReactNode;
  /** The one-click action for this item, e.g. "Nudge on WhatsApp". */
  action?: React.ReactNode;
};

/** One application on the admin board. */
export function ApplicationCard({
  href,
  name,
  reference,
  vehicle,
  note,
  badge,
  action,
}: ApplicationCardProps) {
  return (
    <Card className="relative gap-3 p-4 sm:p-4 hover:border-brand">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* The link's hit area covers the whole card (after:inset-0). */}
          <TextLink
            href={href}
            className="self-start text-base text-ink no-underline after:absolute after:inset-0 after:rounded-card hover:underline"
          >
            {name}
          </TextLink>
          <p className="text-sm text-ink-quiet">
            {reference} · {vehicle}
          </p>
        </div>
      </div>
      {badge && <div className="flex flex-wrap gap-2">{badge}</div>}
      <p className="flex items-center gap-2 text-sm text-ink-quiet">
        <Clock className="size-4 shrink-0" aria-hidden />
        {note}
      </p>
      {action && <div className="relative z-10 [&>*]:w-full">{action}</div>}
    </Card>
  );
}
