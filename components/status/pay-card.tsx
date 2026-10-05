"use client";

import { CircleCheck, Smartphone } from "lucide-react";
import { approveDemoPayment, startPayment } from "@/app/my/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { PhoneInput } from "@/components/ui/phone-input";
import { statusPage } from "@/lib/copy";
import { formatKes } from "@/lib/format/money";

/**
 * Pay for the chosen cover with M-Pesa. Two states: enter the number and
 * send the request; then "check your phone" while the payment is pending.
 * SIMULATED: the demo button plays the part of the phone approving it.
 */
export function PayCard({
  refValue,
  amountKes,
  summary,
  phone,
  pending,
  simulated,
}: {
  refValue: string;
  amountKes: number;
  /** "Britam · Comprehensive" */
  summary: string;
  /** Local format without +254, e.g. "712 345 678". */
  phone: string;
  /** The payment request already sent, if any. */
  pending?: { id: string; phoneDisplay: string };
  simulated: boolean;
}) {
  const copy = statusPage.pay;
  const send = useFlowAction(startPayment);
  const approve = useFlowAction(approveDemoPayment);

  return (
    <Card className="gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-ink-quiet">{copy.amount}</p>
        <p className="text-3xl font-semibold text-ink">{formatKes(amountKes)}</p>
        <p className="text-sm text-ink-quiet">{summary}</p>
      </div>

      {pending ? (
        <div className="flex flex-col gap-3 rounded-control bg-surface-alt p-4">
          <p className="flex items-center gap-2 text-base font-medium text-ink">
            <Smartphone className="size-5 text-brand" aria-hidden />
            {copy.waitingTitle}
          </p>
          <p className="text-sm text-ink-quiet">{copy.waitingBody(pending.phoneDisplay)}</p>
          {simulated && (
            <form action={approve.formAction} className="flex flex-col gap-2">
              <input type="hidden" name="ref" value={refValue} />
              <input type="hidden" name="paymentId" value={pending.id} />
              <Button type="submit" loading={approve.pending}>
                <CircleCheck aria-hidden />
                {copy.demoApprove}
              </Button>
              <p className="text-xs text-ink-quiet">{copy.demoNote}</p>
            </form>
          )}
          {approve.errors._form && <FieldError>{approve.errors._form}</FieldError>}
          <form action={send.formAction}>
            <input type="hidden" name="ref" value={refValue} />
            <input type="hidden" name="phone" value={phone} />
            <Button type="submit" variant="ghost" loading={send.pending}>
              {copy.retry}
            </Button>
          </form>
        </div>
      ) : (
        <form action={send.formAction} className="flex flex-col gap-4" noValidate>
          <input type="hidden" name="ref" value={refValue} />
          <PhoneInput name="phone" label={copy.phoneLabel} defaultValue={send.submitted.phone ?? phone} error={send.errors.phone} />
          {send.errors._form && <FieldError>{send.errors._form}</FieldError>}
          <Button type="submit" loading={send.pending}>
            {copy.action(formatKes(amountKes))}
          </Button>
        </form>
      )}
    </Card>
  );
}
