"use client";

import { startApplication } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { flow } from "@/lib/copy";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/*
 * Step 1 (step 2 after an instant quote): who the cover is for — name,
 * WhatsApp number, optional email — on one screen. No code: this device
 * starts the application, and our messages carry links back to it.
 */

export function PhoneScreen({
  refValue,
  product,
  savedQuote,
  backHref = "/",
  afterQuote = false,
}: {
  refValue?: string;
  product?: string;
  /** Chose an insurer before this step: "Your Britam quote of KES 34,560 is saved…" */
  savedQuote?: string;
  backHref?: string;
  /** Came from the instant quote, which was step 1. */
  afterQuote?: boolean;
}) {
  const { formAction, pending, errors, submitted } = useFlowAction(startApplication);
  const copy = flow.phone;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: afterQuote ? stepOf.phone + 1 : stepOf.phone, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={savedQuote ?? copy.description}
      reassurance={copy.reassurance}
      helpStep={flow.stepNames.phone}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      {refValue && <input type="hidden" name="ref" value={refValue} />}
      {product && <input type="hidden" name="product" value={product} />}
      <Input
        name="name"
        label={flow.name.label}
        hint={copy.nameHint}
        autoComplete="name"
        autoCapitalize="words"
        defaultValue={submitted.name}
        error={errors.name}
        autoFocus
      />
      <PhoneInput
        name="phone"
        label={copy.label}
        hint={copy.hint}
        error={errors.phone}
        defaultValue={submitted.phone}
      />
      <Input
        name="email"
        type="email"
        label={flow.name.emailLabel}
        hint={flow.name.emailHint}
        autoComplete="email"
        inputMode="email"
        defaultValue={submitted.email}
        error={errors.email}
      />
    </FlowStep>
  );
}
