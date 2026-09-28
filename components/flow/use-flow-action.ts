"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { initialResult, type ActionResult } from "@/lib/flow/action-result";

type FlowAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Runs a flow server action. On success: toast (if any) and go to the next
 * screen. On failure: returns field errors to show next to inputs.
 */
export function useFlowAction(action: FlowAction) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(action, initialResult);

  React.useEffect(() => {
    if (!state.ok) return;
    if (state.toast) toast({ title: state.toast });
    router.push(state.next);
  }, [state, router]);

  const errors = state.ok ? {} : state.errors;
  // Stay "busy" while navigating so the button can't be pressed twice.
  return { formAction, pending: pending || state.ok, errors };
}
