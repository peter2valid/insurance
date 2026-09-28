"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { confirmVehicle, savePlate, skipLogbook } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextLink } from "@/components/ui/text-link";
import { flow } from "@/lib/copy";
import type { LogbookField } from "@/lib/extract";
import { screenHref, stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { DocumentUpload } from "./document-upload";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/* Steps 2–3: number plate, snap logbook, confirm what was read. */

type ScreenProps = { refValue: string; backHref: string };

export function PlateScreen({ refValue, backHref, plate }: ScreenProps & { plate?: string }) {
  const { formAction, pending, errors } = useFlowAction(savePlate);
  const copy = flow.vehicle;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.vehicle, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.vehicle}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
      secondaryAction={
        <TextLink href={screenHref("logbook", refValue)} standalone>
          {copy.snapInstead}
        </TextLink>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <Input
        name="plate"
        label={copy.label}
        hint={copy.hint}
        defaultValue={plate}
        error={errors.plate}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        autoFocus
      />
    </FlowStep>
  );
}

export function LogbookScreen({ refValue, backHref }: ScreenProps) {
  const skip = useFlowAction(skipLogbook);
  const [uploading, setUploading] = React.useState(false);
  const copy = flow.logbook;

  return (
    <FlowStep
      as="form"
      action={skip.formAction}
      step={{ current: stepOf.logbook, total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={flow.stepNames.logbook}
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
        kind="logbook"
        refValue={refValue}
        label={copy.label}
        hint={copy.reassurance}
        takePhotoLabel={copy.takePhoto}
        chooseFileLabel={copy.chooseFile}
        processingLabel={copy.reading}
        processingBody={copy.readingBody}
        errorMessages={copy.errors}
        successToast={copy.toast}
      />
    </FlowStep>
  );
}

const confirmFields: { name: LogbookField; autoComplete?: string; inputMode?: "numeric"; optional?: boolean }[] = [
  { name: "plate" },
  { name: "make" },
  { name: "model" },
  { name: "year", inputMode: "numeric" },
  { name: "chassisNumber" },
  { name: "bodyType", optional: true },
  { name: "ownerName", optional: true },
];

export function ConfirmScreen({
  refValue,
  backHref,
  values,
  lowConfidence,
  extracted,
}: ScreenProps & { values: Record<string, string>; lowConfidence: string[]; extracted: boolean }) {
  const { formAction, pending, errors } = useFlowAction(confirmVehicle);
  const copy = flow.confirm;

  return (
    <FlowStep
      as="form"
      action={formAction}
      noValidate
      step={{ current: stepOf.confirm, total: TOTAL_STEPS }}
      backHref={backHref}
      title={extracted ? copy.titleExtracted : copy.titleManual}
      description={extracted ? copy.descriptionExtracted : copy.descriptionManual}
      helpStep={flow.stepNames.confirm}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      {confirmFields.map((field) => {
        const unsure = lowConfidence.includes(field.name);
        const baseHint =
          !extracted && field.name in copy.hints ? copy.hints[field.name as keyof typeof copy.hints] : undefined;
        return (
          <Input
            key={field.name}
            name={field.name}
            label={copy.fields[field.name]}
            defaultValue={values[field.name] ?? ""}
            error={errors[field.name]}
            optional={field.optional}
            inputMode={field.inputMode}
            autoCapitalize={field.name === "plate" || field.name === "chassisNumber" ? "characters" : undefined}
            spellCheck={false}
            hint={
              unsure ? (
                <span className="flex items-center gap-2 font-medium text-ink">
                  <TriangleAlert className="size-4 shrink-0 text-warn" aria-hidden />
                  {copy.checkThis}
                </span>
              ) : (
                baseHint
              )
            }
          />
        );
      })}
    </FlowStep>
  );
}
