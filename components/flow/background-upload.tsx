"use client";

import * as React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "@/components/ui/toast";
import type { DocumentType } from "@/lib/data/types";
import { prepareFile, startUpload } from "@/lib/uploads/background";

/**
 * Camera-first picker that hands the file to the background uploader, so
 * the client can carry on straight away. `onStarted` runs after the upload
 * has begun (e.g. go to the next screen, or close a dialog).
 */
export function BackgroundUpload({
  kind,
  refValue,
  label,
  hint,
  documentName,
  takePhotoLabel,
  chooseFileLabel,
  errorMessages,
  successToast,
  startedToast,
  beforeStart,
  onStarted,
}: {
  kind: DocumentType;
  refValue: string;
  label: string;
  hint?: string;
  /** Name shown in the progress pill, e.g. "national ID". */
  documentName: string;
  takePhotoLabel: string;
  chooseFileLabel: string;
  errorMessages: Record<string, string> & { upload: string };
  successToast: string;
  startedToast?: string;
  /** Runs before navigating on (e.g. tell the server the document is on its way). Return false to stop. */
  beforeStart?: () => Promise<boolean>;
  onStarted?: () => void;
}) {
  const [error, setError] = React.useState<string>();
  const [busy, setBusy] = React.useState(false);

  async function handleSelect(picked: File) {
    setError(undefined);
    setBusy(true);
    const prepared = await prepareFile(picked);
    if ("error" in prepared) {
      setError(errorMessages[prepared.error] ?? errorMessages.upload);
      setBusy(false);
      return;
    }
    if (beforeStart && !(await beforeStart())) {
      setError(errorMessages.upload);
      setBusy(false);
      return;
    }
    startUpload({ file: prepared.file, kind, refValue, label: documentName, successToast });
    if (startedToast) toast({ title: startedToast, tone: "info" });
    onStarted?.();
  }

  return (
    <FileUpload
      label={label}
      hint={hint}
      state={error ? "error" : "empty"}
      error={error}
      emphasis="primary"
      takePhotoLabel={takePhotoLabel}
      chooseFileLabel={chooseFileLabel}
      disabled={busy}
      onSelect={handleSelect}
    />
  );
}
