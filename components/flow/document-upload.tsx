"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { FileUpload, type FileUploadState } from "@/components/ui/file-upload";
import { toast } from "@/components/ui/toast";
import type { DocumentType } from "@/lib/data/types";
import { compressImage } from "@/lib/images/compress";

type Messages = Record<string, string> & { upload: string };

type DocumentUploadProps = {
  kind: DocumentType;
  refValue: string;
  label: string;
  hint?: string;
  takePhotoLabel: string;
  chooseFileLabel: string;
  /** Shown after the upload finishes while the server works (e.g. reading the logbook). */
  processingLabel?: string;
  processingBody?: string;
  errorMessages: Messages;
  successToast: string;
  /** Tells the screen an upload is in progress, so it can disable skip buttons. */
  onBusyChange?: (busy: boolean) => void;
  /** Called on success instead of navigating (e.g. the status page refreshes in place). */
  onDone?: () => void;
};

type Phase =
  | { name: "idle" }
  | { name: "uploading"; progress: number; fileName: string; previewUrl?: string }
  | { name: "processing"; fileName: string; previewUrl?: string }
  | { name: "error"; message: string };

/**
 * Compress → upload with real progress → server processes → next screen.
 * Uses XMLHttpRequest because fetch can't report upload progress.
 */
export function DocumentUpload({
  kind,
  refValue,
  label,
  hint,
  takePhotoLabel,
  chooseFileLabel,
  processingLabel,
  processingBody,
  errorMessages,
  successToast,
  onBusyChange,
  onDone,
}: DocumentUploadProps) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<Phase>({ name: "idle" });
  const previewRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const busy = phase.name === "uploading" || phase.name === "processing";
  React.useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  async function handleSelect(picked: File) {
    const file = await compressImage(picked);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    previewRef.current = previewUrl;
    setPhase({ name: "uploading", progress: 0, fileName: file.name, previewUrl });

    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    form.append("ref", refValue);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setPhase({ name: "uploading", progress: (event.loaded / event.total) * 100, fileName: file.name, previewUrl });
      }
    };
    xhr.upload.onload = () => setPhase({ name: "processing", fileName: file.name, previewUrl });
    xhr.onerror = () => setPhase({ name: "error", message: errorMessages.upload });
    xhr.onload = () => {
      const body = xhr.response as { ok: boolean; next?: string; code?: string } | null;
      if (body?.ok && body.next) {
        toast({ title: successToast });
        if (onDone) onDone();
        else router.push(body.next);
        return;
      }
      setPhase({ name: "error", message: errorMessages[body?.code ?? "upload"] ?? errorMessages.upload });
    };
    xhr.send(form);
  }

  const state: FileUploadState =
    phase.name === "uploading" ? "uploading" : phase.name === "processing" ? "uploaded" : phase.name === "error" ? "error" : "empty";

  return (
    <div className="flex flex-col gap-4">
      <FileUpload
        label={label}
        hint={hint}
        state={state}
        progress={phase.name === "uploading" ? phase.progress : 100}
        fileName={phase.name === "uploading" || phase.name === "processing" ? phase.fileName : undefined}
        previewUrl={phase.name === "uploading" || phase.name === "processing" ? phase.previewUrl : undefined}
        error={phase.name === "error" ? phase.message : undefined}
        emphasis="primary"
        takePhotoLabel={takePhotoLabel}
        chooseFileLabel={chooseFileLabel}
        disabled={phase.name === "processing"}
        onSelect={handleSelect}
      />
      {phase.name === "processing" && processingLabel && (
        <div role="status" className="flex items-start gap-3 rounded-card bg-surface-alt p-4">
          <LoaderCircle className="size-5 shrink-0 animate-spin text-brand" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-ink">{processingLabel}</p>
            {processingBody && <p className="text-sm text-ink-quiet">{processingBody}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
