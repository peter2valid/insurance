"use client";

import * as React from "react";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/flow/action-result";

type AdminAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/** Run an admin action; errors show as a toast so nothing fails silently. */
export function useAdminAction(action: AdminAction, onSuccess?: () => void) {
  const result = useFlowAction(action, onSuccess);
  const formError = result.errors._form;
  React.useEffect(() => {
    if (formError) toast({ title: formError, tone: "error" });
  }, [formError]);
  return result;
}

/** A one-click admin action: a form with hidden fields and one button. */
export function ActionButton({
  action,
  fields,
  label,
  icon,
  variant = "secondary",
  block,
}: {
  action: AdminAction;
  fields: Record<string, string>;
  label: string;
  /** A rendered icon, e.g. <MessageCircle aria-hidden /> (elements cross the server/client boundary; components don't). */
  icon?: React.ReactNode;
  variant?: ButtonProps["variant"];
  block?: boolean;
}) {
  const { formAction, pending } = useAdminAction(action);
  return (
    <form action={formAction} className={block ? "w-full" : undefined}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button type="submit" variant={variant} loading={pending} block={block}>
        {!pending && icon}
        {label}
      </Button>
    </form>
  );
}
