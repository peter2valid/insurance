"use client";

import * as React from "react";
import { Camera, FileText, RefreshCw, Upload, X } from "lucide-react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Field } from "./field";
import { ProgressBar } from "./progress-bar";

type FileUploadState = "empty" | "uploading" | "uploaded" | "error";

type FileUploadProps = {
  id?: string;
  label: string;
  /** Reassurance goes here, where people hesitate (who sees it, how it's kept). */
  hint?: React.ReactNode;
  state?: FileUploadState;
  /** 0–100 while uploading. */
  progress?: number;
  fileName?: string;
  /** Object URL for an image preview. PDFs show an icon instead. */
  previewUrl?: string;
  error?: string;
  accept?: string;
  disabled?: boolean;
  optional?: boolean;
  /** "primary" when uploading is the main action on the screen. */
  emphasis?: "primary" | "secondary";
  takePhotoLabel?: string;
  chooseFileLabel?: string;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  className?: string;
};

/**
 * Camera-first upload. On touch devices "Take a photo" opens the rear
 * camera and "Choose a file" is the fallback; on desktop only "Choose a
 * file" shows. Compression happens in the caller before upload.
 */
function FileUpload({
  id,
  label,
  hint,
  state = "empty",
  progress = 0,
  fileName,
  previewUrl,
  error,
  accept = "image/*,application/pdf",
  disabled,
  optional,
  emphasis = "secondary",
  takePhotoLabel = kit.upload.takePhoto,
  chooseFileLabel = kit.upload.chooseFile,
  onSelect,
  onRemove,
  className,
}: FileUploadProps) {
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = ""; // allow picking the same file again
  }

  const hasFile = state === "uploading" || state === "uploaded";

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={state === "error" ? error : undefined}
      optional={optional}
      className={className}
    >
      {(a11y) => (
        <div
          className={cn(
            "flex flex-col gap-4 rounded-card border border-dashed bg-surface p-4",
            state === "error" ? "border-danger" : "border-border",
            hasFile && "border-solid",
          )}
        >
          {/* Hidden inputs; the buttons below open them. */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={handleChange}
            disabled={disabled}
          />
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="sr-only"
            tabIndex={-1}
            onChange={handleChange}
            disabled={disabled}
            {...a11y}
          />

          {hasFile ? (
            <div className="flex items-center gap-3">
              <FilePreview previewUrl={previewUrl} />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="truncate text-base font-medium text-ink">{fileName}</p>
                {state === "uploading" ? (
                  <div className="flex flex-col gap-1" aria-live="polite">
                    <ProgressBar value={progress} label={kit.upload.uploading} />
                    <p className="text-sm text-ink-quiet">
                      {kit.upload.uploading} · {Math.round(progress)}%
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-success" aria-live="polite">
                    {kit.upload.uploaded}
                  </p>
                )}
              </div>
              {state === "uploaded" && onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  aria-label={`${kit.upload.remove} ${fileName ?? ""}`.trim()}
                  disabled={disabled}
                >
                  <X aria-hidden />
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-quiet">{kit.upload.accepted}</p>
          )}

          {state !== "uploading" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              {state === "uploaded" ? (
                <Button
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={disabled}
                >
                  <RefreshCw aria-hidden />
                  {kit.upload.replace}
                </Button>
              ) : (
                <>
                  <Button
                    variant={emphasis}
                    className="hidden pointer-coarse:inline-flex"
                    onClick={() => cameraRef.current?.click()}
                    disabled={disabled}
                  >
                    <Camera aria-hidden />
                    {takePhotoLabel}
                  </Button>
                  <Button
                    variant={emphasis}
                    className="pointer-coarse:hidden"
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled}
                  >
                    <Upload aria-hidden />
                    {chooseFileLabel}
                  </Button>
                  <Button
                    variant="ghost"
                    className="hidden pointer-coarse:inline-flex"
                    onClick={() => fileRef.current?.click()}
                    disabled={disabled}
                  >
                    <Upload aria-hidden />
                    {chooseFileLabel}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Field>
  );
}

function FilePreview({ previewUrl }: { previewUrl?: string }) {
  if (previewUrl) {
    return (
      // Local object URL preview; next/image cannot optimise blob: URLs.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={previewUrl}
        alt=""
        className="size-16 shrink-0 rounded-control border border-border object-cover"
      />
    );
  }
  return (
    <span className="flex size-16 shrink-0 items-center justify-center rounded-control bg-surface-alt text-ink-quiet">
      <FileText className="size-6" aria-hidden />
    </span>
  );
}

export { FileUpload };
export type { FileUploadProps, FileUploadState };
