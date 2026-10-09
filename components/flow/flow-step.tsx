import * as React from "react";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { MinimalHeader } from "@/components/site/minimal-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { StepHeader } from "@/components/ui/step-header";
import { FormMemory } from "./form-memory";
import { StepArrival } from "./step-arrival";
import { flow } from "@/lib/copy";

/*
 * FlowStep template (CLAUDE.md §4.2, §8.1): one question per screen, a
 * progress indicator, one primary action. Pages supply the question, the
 * fields and the buttons; the template owns the layout.
 */

function FlowShell({ helpStep, children }: { helpStep: string; children: React.ReactNode }) {
  return (
    <>
      <MinimalHeader helpLabel={flow.help} helpMessage={flow.helpMessage(helpStep)} />
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-6 px-4 py-6 md:py-12">
        {children}
      </main>
    </>
  );
}

type FlowStepOwnProps = {
  step: { current: number; total: number };
  backHref?: string;
  /** The one question this screen asks. Becomes the page's h1. */
  title: string;
  description?: string;
  /** Fields for the question. */
  children: React.ReactNode;
  /** Exactly one primary Button. Full width on phones. Omit when a kit
   *  component in the body owns the primary action (e.g. FileUpload). */
  primaryAction?: React.ReactNode;
  /** Optional quieter alternative: a TextLink or ghost Button. */
  secondaryAction?: React.ReactNode;
  /** Reassurance shown where people hesitate (privacy, who sees it). */
  reassurance?: string;
  /** Plain name of the step, used in the "Need help?" WhatsApp message. */
  helpStep?: string;
  /** Shown above the fields: a form-level error (role="alert"). */
  formError?: string;
};

type FlowStepProps = FlowStepOwnProps &
  (
    | ({ as?: "div" } & Omit<React.ComponentProps<"div">, keyof FlowStepOwnProps>)
    | ({ as: "form" } & Omit<React.ComponentProps<"form">, keyof FlowStepOwnProps>)
  );

export function FlowStep({
  step,
  backHref,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  reassurance,
  helpStep,
  formError,
  as = "div",
  ...rest
}: FlowStepProps) {
  const Comp = as as React.ElementType;

  return (
    <FlowShell helpStep={helpStep ?? title}>
      <StepArrival step={title} />
      <StepHeader current={step.current} total={step.total} backHref={backHref} />
      <Comp className="flex flex-col gap-6" {...rest}>
        <div className="flex flex-col gap-2">
          {/* tabIndex -1: focusable by script on arrival, not in the tab order. */}
          <h1 tabIndex={-1} className="text-2xl outline-none md:text-3xl">
            {title}
          </h1>
          {description && <p className="max-w-prose text-lg text-ink-quiet">{description}</p>}
        </div>

        {as === "form" && <FormMemory />}
        {formError && <FieldError>{formError}</FieldError>}

        <div className="flex flex-col gap-4">{children}</div>

        {reassurance && (
          <p className="flex max-w-prose items-start gap-2 text-sm text-ink-quiet">
            <span className="flex h-5 shrink-0 items-center">
              <ShieldCheck className="size-4 text-brand" aria-hidden />
            </span>
            {reassurance}
          </p>
        )}

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-6 [&>button]:w-full sm:[&>button]:w-auto">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </Comp>
    </FlowShell>
  );
}

/** Loading state: same shape as a step, so nothing jumps when it arrives. */
export function FlowStepSkeleton() {
  return (
    <FlowShell helpStep={flow.help}>
      <div aria-busy="true" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" className="ml-auto w-24" />
          <Skeleton shape="line" className="h-1 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton shape="line" className="h-8 w-3/4" />
          <Skeleton shape="line" className="w-1/2" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-11 w-full rounded-control sm:w-40" />
      </div>
    </FlowShell>
  );
}

/** Error state: says what went wrong and how to fix it. */
export function FlowStepError({ action }: { action: React.ReactNode }) {
  return (
    <FlowShell helpStep={flow.loadError.title}>
      <EmptyState
        tone="error"
        icon={CircleAlert}
        title={flow.loadError.title}
        body={flow.loadError.body}
        action={action}
      />
    </FlowShell>
  );
}
