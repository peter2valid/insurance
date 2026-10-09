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

  // A mistake: bring the first field with an error into view and put the cursor there.
  React.useEffect(() => {
    if (state.ok || state === initialResult) return;
    requestAnimationFrame(() => {
      // A real field first (wrappers like the +254 prefix are marked too), else the message.
      const field =
        document.querySelector<HTMLElement>('main :is(input, select, textarea)[aria-invalid="true"]') ??
        document.querySelector<HTMLElement>('main [role="alert"]');
      if (!field) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      field.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      if (field.matches("input, select, textarea")) field.focus({ preventScroll: true });
    });
  }, [state]);

  React.useEffect(() => {
    if (!state.ok) return;
    if (state.toast) toast({ title: state.toast });
    onSuccessRef.current?.();
    const target = new URL(state.next, window.location.href);
    const samePage = target.pathname + target.search === window.location.pathname + window.location.search;
    if (samePage) {
      // Same page (maybe a new #anchor): a push would only scroll, so refresh the data too.
      startNavigation(() => {
        if (target.hash) window.history.replaceState(null, "", target.hash);
        router.refresh();
      });
      if (target.hash) setTimeout(() => document.querySelector(target.hash)?.scrollIntoView({ block: "start" }), 400);
    } else {
      startNavigation(() => router.push(state.next));
    }
  }, [state, router]);

  const errors = state.ok ? {} : state.errors;
  // Stay "busy" until the next screen (or refreshed page) is ready, so the
  // button can't be pressed twice — then free again for the next action.
  return { formAction: submit, pending: pending || navigating, errors, submitted };
}
