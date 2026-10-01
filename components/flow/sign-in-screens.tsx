"use client";

import * as React from "react";
import { resendCode, sendCode, verifyCode } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { TextLink } from "@/components/ui/text-link";
import { flow } from "@/lib/copy";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/* Step 1: phone number, then the code. SIMULATED sign-in (code 123456). */

export function PhoneScreen({ refValue, product }: { refValue?: string; product?: string }) {
  const { formAction, pending, errors, submitted } = useFlowAction(sendCode);
  const copy = flow.phone;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.phone, total: TOTAL_STEPS }}
      backHref="/"
      title={copy.title}
      description={copy.description}
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
      <PhoneInput
        name="phone"
        label={copy.label}
        hint={copy.hint}
        error={errors.phone}
        defaultValue={submitted.phone}
        autoFocus
      />
    </FlowStep>
  );
}

export function CodeScreen({ phone, refValue }: { phone: string; refValue?: string }) {
  const verify = useFlowAction(verifyCode);
  const resend = useFlowAction(resendCode);
  const [code, setCode] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const copy = flow.code;

  // Clear the boxes after a wrong or expired code so the next try is easy.
  const codeError = verify.errors.code;
  const [lastError, setLastError] = React.useState(codeError);
  if (codeError !== lastError) {
    setLastError(codeError);
    if (codeError) setCode("");
  }

  return (
    <FlowStep
      as="form"
      ref={formRef}
      action={verify.formAction}
      noValidate
      step={{ current: stepOf.code, total: TOTAL_STEPS }}
      backHref={refValue ? `/start/phone?ref=${encodeURIComponent(refValue)}` : "/start/phone"}
      title={copy.title}
      description={copy.description(phone)}
      reassurance={copy.demoHint}
      helpStep={flow.stepNames.code}
      formError={verify.errors._form}
      primaryAction={
        <Button type="submit" loading={verify.pending}>
          {copy.action}
        </Button>
      }
      secondaryAction={
        <Button type="submit" variant="ghost" formAction={resend.formAction} loading={resend.pending}>
          {copy.resend}
        </Button>
      }
    >
      {refValue && <input type="hidden" name="ref" value={refValue} />}
      <input type="hidden" name="code" value={code} />
      <OtpInput
        label={copy.label}
        value={code}
        onChange={setCode}
        onComplete={() => requestAnimationFrame(() => formRef.current?.requestSubmit())}
        error={codeError}
        disabled={verify.pending}
        autoFocus
      />
      <TextLink href="/start/phone" standalone className="text-sm">
        {copy.changeNumber}
      </TextLink>
    </FlowStep>
  );
}
