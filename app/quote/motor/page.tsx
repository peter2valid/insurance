import type { Metadata } from "next";
import { MotorQuoteForm } from "@/components/quote/motor-quote-form";
import { StepNames } from "@/components/ui/step-track";
import { flow, quote } from "@/lib/copy";
import { fromSearchParams, MAX_START_DAYS } from "@/lib/flow/motor-quote";
import { requestTime, todayIso } from "@/lib/format/date";

export const metadata: Metadata = { title: quote.form.title };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Instant motor quote, step 1. Open to everyone — no sign-in. Answers from
 * the address (coming back via "Change details") fill the form.
 */
export default async function MotorQuotePage(props: PageProps<"/quote/motor">) {
  const values = fromSearchParams(await props.searchParams);
  const now = requestTime();
  return (
    <StepNames names={flow.journeySteps.motor}>
      <MotorQuoteForm values={values} today={todayIso(now)} lastStartDate={todayIso(now + MAX_START_DAYS * DAY_MS)} />
    </StepNames>
  );
}
