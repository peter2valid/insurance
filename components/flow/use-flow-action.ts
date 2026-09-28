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
export function useFlowAction(action: FlowAction, onSuccess?: () => void) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(action, initialResult);
  const onSuccessRef = React.useRef(onSuccess);
  React.useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const [navigating, startNavigation] = React.useTransition();

  React.useEffect(() => {
    if (!state.ok) return;
    if (state.toast) toast({ title: state.toast });
    onSuccessRef.current?.();
    startNavigation(() => router.push(state.next));
  }, [state, router]);

  const errors = state.ok ? {} : state.errors;
  // Stay "busy" until the next screen (or refreshed page) is ready, so the
  // button can't be pressed twice — then free again for the next action.
  return { formAction, pending: pending || navigating, errors };
}
