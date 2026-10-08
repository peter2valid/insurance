"use client";

import { CircleCheck, CircleDashed } from "lucide-react";
import { submitApplication } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { flow } from "@/lib/copy";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/* Step 5: check everything, then one button to send. */

export type ReviewSection = {
  id: string;
  title: string;
  changeHref: string;
  rows: { label: string; value: string }[];
};

export type ReviewDocument = { label: string; status: string; done: boolean };

export function ReviewScreen({
  refValue,
  backHref,
  sections,
  documents,
  actionLabel,
  note,
}: {
  refValue: string;
  backHref: string;
  sections: ReviewSection[];
  documents: ReviewDocument[];
  /** Motor with an insurer chosen: "Send and go to payment". */
  actionLabel?: string;
  /** What happens after pressing the button. */
  note?: string;
}) {
  const { formAction, pending, errors } = useFlowAction(submitApplication);
  const copy = flow.review;

  return (
    <FlowStep
      as="form"
      action={formAction}
      step={{ current: stepOf.review, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.review}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {actionLabel ?? copy.action}
        </Button>
      }
      reassurance={note}
    >
      <input type="hidden" name="ref" value={refValue} />
      {sections.map((section) => (
        <Card key={section.id} className="gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-sans text-lg font-semibold">{section.title}</h2>
            <TextLink
              href={section.changeHref}
              standalone
              aria-label={`${flow.change}: ${section.title}`}
            >
              {flow.change}
            </TextLink>
          </div>
          <dl className="flex flex-col divide-y divide-border">
            {section.rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0 sm:flex-row sm:gap-4">
                <dt className="text-sm text-ink-quiet sm:w-40 sm:shrink-0">{row.label}</dt>
                <dd className="text-base text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}

      <Card className="gap-3">
        <h2 className="font-sans text-lg font-semibold">{copy.sections.documents}</h2>
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.label} className="flex items-start gap-3">
              {doc.done ? (
                <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />
              ) : (
                <CircleDashed className="size-5 shrink-0 text-warn" aria-hidden />
              )}
              <span className="flex flex-col">
                <span className="text-base text-ink">{doc.label}</span>
                <span className="text-sm text-ink-quiet">{doc.status}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </FlowStep>
  );
}
