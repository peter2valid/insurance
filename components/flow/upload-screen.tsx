"use client";

import * as React from "react";
import { skipDocument } from "@/app/start/actions";
import { Button } from "@/components/ui/button";
import { flow, questions } from "@/lib/copy";
import { stepOf, TOTAL_STEPS, uploadScreens } from "@/lib/flow/screens";
import { DocumentUpload } from "./document-upload";
import { FlowStep } from "./flow-step";
import { useFlowAction } from "./use-flow-action";

/**
 * Document upload screen for passport (travel) and business registration.
 * Camera-first upload, with "I'll upload it later" as the quiet way out.
 */
export function UploadScreen({
  screen,
  refValue,
  backHref,
}: {
  screen: "passport" | "registration";
  refValue: string;
  backHref: string;
}) {
  const skip = useFlowAction(skipDocument);
  const [uploading, setUploading] = React.useState(false);
  const copy = questions[screen];
  const { document } = uploadScreens[screen];

  return (
    <FlowStep
      as="form"
      action={skip.formAction}
      step={{ current: stepOf[screen], total: TOTAL_STEPS }}
      backHref={backHref}
      title={copy.title}
      description={copy.description}
      helpStep={copy.stepName}
      formError={skip.errors._form}
      secondaryAction={
        <Button type="submit" variant="ghost" loading={skip.pending} disabled={uploading}>
          {copy.later}
        </Button>
      }
    >
      <input type="hidden" name="ref" value={refValue} />
      <input type="hidden" name="document" value={document} />
      <DocumentUpload
        onBusyChange={setUploading}
        kind={document}
        refValue={refValue}
        label={copy.label}
        hint={copy.reassurance}
        takePhotoLabel={flow.logbook.takePhoto}
        chooseFileLabel={flow.logbook.chooseFile}
        errorMessages={flow.id.errors}
        successToast={copy.toast}
      />
    </FlowStep>
  );
}
