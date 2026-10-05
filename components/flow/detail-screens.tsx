"use client";

import * as React from "react";
import { saveCover, saveName, saveValue, skipId } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { Input } from "@/components/ui/input";
import { flow } from "@/lib/copy";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { FlowBackgroundUpload } from "./flow-background-upload";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/* Only what's actually needed — cover, value, your details, ID. */

type ScreenProps = { refValue: string; backHref: string };

export function CoverScreen({
  refValue,
  backHref,
  coverType,
  allowed,
}: ScreenProps & { coverType?: string; allowed: readonly string[] }) {
  const { formAction, pending, errors, submitted } = useFlowAction(saveCover);
  const copy = flow.cover;
  const options = copy.options.filter((option) => allowed.includes(option.value));

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.cover, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.cover}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <ChoiceCards
        name="coverType"
        label={copy.label}
        hideLabel
        options={options}
        defaultValue={submitted.coverType ?? (coverType && allowed.includes(coverType) ? coverType : undefined)}
        error={errors.coverType}
      />
    </FlowStep>
  );
}

export function ValueScreen({ refValue, backHref, value }: ScreenProps & { value?: string }) {
  const { formAction, pending, errors, submitted } = useFlowAction(saveValue);
  const copy = flow.value;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.value, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.value}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <Input
        name="value"
        label={copy.label}
        hint={copy.hint}
        prefix={copy.prefix}
        inputMode="numeric"
        autoComplete="off"
        defaultValue={submitted.value ?? (value ? Number(value).toLocaleString("en-KE") : "")}
        error={errors.value}
        autoFocus
      />
    </FlowStep>
  );
}

export function NameScreen({
  refValue,
  backHref,
  name,
  email,
  description,
}: ScreenProps & { name?: string; email?: string; description?: string }) {
  const { formAction, pending, errors, submitted } = useFlowAction(saveName);
  const copy = flow.name;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.name, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={description ?? copy.description}
      helpStep={flow.stepNames.name}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <Input
        name="name"
        label={copy.label}
        autoComplete="name"
        autoCapitalize="words"
        defaultValue={submitted.name ?? name}
        error={errors.name}
        autoFocus
      />
      <Input
        name="email"
        type="email"
        label={copy.emailLabel}
        hint={copy.emailHint}
        autoComplete="email"
        inputMode="email"
        defaultValue={submitted.email ?? email}
        error={errors.email}
      />
    </FlowStep>
  );
}

export function IdScreen({ refValue, backHref }: ScreenProps) {
  const skip = useFlowAction(skipId);
  const copy = flow.id;

  return (
    <FlowStep
      as="form"
      action={skip.formAction}
      step={{ current: stepOf.id, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.id}
      formError={skip.errors._form}
      secondaryAction={
        <Button type="submit" variant="ghost" loading={skip.pending}>
          {copy.later}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <FlowBackgroundUpload
        kind="national_id"
        refValue={refValue}
        label={copy.label}
        hint={copy.reassurance}
        documentName={flow.documentsInline.national_id}
        successToast={copy.toast}
      />
    </FlowStep>
  );
}
