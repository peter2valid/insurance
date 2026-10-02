"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { nudgeAction } from "@/app/admin/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAdminAction } from "./action-button";

/**
 * "Nudge on WhatsApp". For a real applicant it opens the admin's own
 * WhatsApp with the pre-written message to the client's number (they press
 * send — a real message), and logs it in the Outbox. For sample clients it
 * only logs the simulated message.
 *
 * The link opens on the click itself (browsers block pop-ups opened later),
 * and the log is recorded alongside.
 */
export function NudgeButton({
  refValue,
  whatsappUrl,
  label,
  from,
  variant = "secondary",
  block,
  title,
}: {
  refValue: string;
  /** Present only for real (non-sample) numbers. */
  whatsappUrl?: string;
  label: string;
  from?: "board";
  variant?: ButtonProps["variant"];
  block?: boolean;
  /** Tooltip explaining what happens. */
  title?: string;
}) {
  const { formAction, pending } = useAdminAction(nudgeAction);
  const [, startTransition] = React.useTransition();

  function record() {
    const data = new FormData();
    data.set("ref", refValue);
    if (from) data.set("from", from);
    startTransition(() => formAction(data));
  }

  if (whatsappUrl) {
    return (
      <Button asChild variant={variant} block={block}>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={record} title={title} aria-busy={pending || undefined}>
          <MessageCircle aria-hidden />
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button variant={variant} block={block} onClick={record} loading={pending} title={title}>
      {!pending && <MessageCircle aria-hidden />}
      {label}
    </Button>
  );
}
