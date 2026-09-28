import * as React from "react";
import { CircleAlert } from "lucide-react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";

/*
 * Internal building block for Input, PhoneInput, OtpInput, Select and
 * FileUpload: label, hint and error wired up with the right ids.
 * Not used directly by screens.
 */

type FieldA11y = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FieldProps = {
  id?: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  /** Visually hide the label (it stays for screen readers). */
  hideLabel?: boolean;
  className?: string;
  children: (a11y: FieldA11y) => React.ReactNode;
};

function Field({
  id: idProp,
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
  children,
}: FieldProps) {
  const autoId = React.useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className={cn("text-base font-medium text-ink", hideLabel && "sr-only")}
      >
        {label}
        {optional && (
          <span className="font-normal text-ink-quiet"> ({kit.optional})</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-quiet">
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="flex items-start gap-2 text-sm text-danger">
      <span className="flex h-5 shrink-0 items-center">
        <CircleAlert className="size-4" aria-hidden />
      </span>
      <span>{children}</span>
    </p>
  );
}

/** Shared look for text-like controls so every input matches. */
const controlClass =
  "min-h-touch w-full rounded-control border border-border bg-surface px-3 text-base text-ink transition-colors placeholder:text-ink-quiet hover:border-ink-quiet focus-visible:border-brand disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60 aria-invalid:border-danger";

export { Field, FieldError, controlClass };
export type { FieldProps, FieldA11y };
