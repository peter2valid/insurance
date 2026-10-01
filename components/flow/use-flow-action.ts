"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { initialResult, type ActionResult } from "@/lib/flow/action-result";

type FlowAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * Runs a flow server action. On success: toast (if any) and go to the next
 * screen. On failure: returns field errors to show next to inputs, plus
 * `submitted` — what the person typed. React resets a form after its action
 * runs, so inputs use `submitted` as their default to keep their answers.
 */
export function useFlowAction(action: FlowAction, onSuccess?: () => void) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(action, initialResult);
  const onSuccessRef = React.useRef(onSuccess);
  React.useEffect(() => {
    onSuccessRef.current = onSuccess;
  });

  const [navigating, startNavigation] = React.useTransition();
  const [submitted, setSubmitted] = React.useState<Record<string, string>>({});

  const submit = React.useCallback(
    (formData: FormData) => {
      const values: Record<string, string> = {};
      formData.forEach((value, key) => {
        if (typeof value !== "string") return;
        values[key] = key in values ? `${values[key]},${value}` : value; // multi-choice
      });
      setSubmitted(values);
      return formAction(formData);
    },
    [formAction],
  );

  React.useEffect(() => {
    if (!state.ok) return;
    if (state.toast) toast({ title: state.toast });
    onSuccessRef.current?.();
    startNavigation(() => router.push(state.next));
  }, [state, router]);

  const errors = state.ok ? {} : state.errors;
  // Stay "busy" until the next screen (or refreshed page) is ready, so the
  // button can't be pressed twice — then free again for the next action.
  return { formAction: submit, pending: pending || navigating, errors, submitted };
}
