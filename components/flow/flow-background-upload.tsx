"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deferDocument } from "@/app/start/actions";
import { flow } from "@/lib/copy";
import type { DocumentType } from "@/lib/data/types";
import { initialResult } from "@/lib/flow/action-result";
import { BackgroundUpload } from "./background-upload";

/**
 * Flow upload screens (ID, passport, registration): pick a photo and go
 * straight to the next question while it uploads in the background.
 */
export function FlowBackgroundUpload({
  kind,
  refValue,
  label,
  hint,
  documentName,
  successToast,
}: {
  kind: DocumentType;
  refValue: string;
  label: string;
  hint?: string;
  documentName: string;
  successToast: string;
}) {
  const router = useRouter();
  const next = React.useRef<string | null>(null);

  async function beforeStart() {
    const form = new FormData();
    form.set("ref", refValue);
    form.set("document", kind);
    const result = await deferDocument(initialResult, form);
    if (!result.ok) return false;
    next.current = result.next;
    return true;
  }

  return (
    <BackgroundUpload
      kind={kind}
      refValue={refValue}
      label={label}
      hint={hint}
      documentName={documentName}
      takePhotoLabel={flow.logbook.takePhoto}
      chooseFileLabel={flow.logbook.chooseFile}
      errorMessages={flow.id.errors}
      successToast={successToast}
      beforeStart={beforeStart}
      onStarted={() => {
        if (next.current) router.push(next.current);
      }}
    />
  );
}
