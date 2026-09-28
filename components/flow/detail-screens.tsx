"use client";

import * as React from "react";
import { saveCover, saveName, saveValue, skipId } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { Input } from "@/components/ui/input";
import { flow } from "@/lib/copy";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { DocumentUpload } from "./document-upload";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/* Step 4: only what's actually needed — cover, value, name, ID. */

type ScreenProps = { refValue: string; backHref: string };

export function CoverScreen({ refValue, backHref, coverType }: ScreenProps & { coverType?: string }) {
  const { formAction, pending, errors } = useFlowAction(saveCover);
  const copy = flow.cover;

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
        options={copy.options}
        defaultValue={coverType}
        error={errors.coverType}
      />
    </FlowStep>
  );
}

export function ValueScreen({ refValue, backHref, value }: ScreenProps & { value?: string }) {
  const { formAction, pending, errors } = useFlowAction(saveValue);
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
        defaultValue={value ? Number(value).toLocaleString("en-KE") : ""}
        error={errors.value}
        autoFocus
      />
    </FlowStep>
  );
}

export function NameScreen({ refValue, backHref, name }: ScreenProps & { name?: string }) {
  const { formAction, pending, errors } = useFlowAction(saveName);
  const copy = flow.name;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.name, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
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
        defaultValue={name}
        error={errors.name}
        autoFocus
      />
    </FlowStep>
  );
}

export function IdScreen({ refValue, backHref }: ScreenProps) {
  const skip = useFlowAction(skipId);
  const [uploading, setUploading] = React.useState(false);
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
        <Button type="submit" variant="ghost" loading={skip.pending} disabled={uploading}>
          {copy.later}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <DocumentUpload
        onBusyChange={setUploading}
        kind="national_id"
        refValue={refValue}
        label={copy.label}
        hint={copy.reassurance}
        takePhotoLabel={flow.logbook.takePhoto}
        chooseFileLabel={flow.logbook.chooseFile}
        errorMessages={copy.errors}
        successToast={copy.toast}
      />
    </FlowStep>
  );
}
