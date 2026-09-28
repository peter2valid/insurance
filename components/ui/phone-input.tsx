import * as React from "react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Field } from "./field";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "children" | "type"> & {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  "data-force"?: string;
};

/**
 * Kenyan mobile number with a fixed +254 prefix. Validate with
 * normalizeKenyanPhone() from lib/format/phone.
 */
function PhoneInput({
  id,
  label,
  hint,
  error,
  optional,
  className,
  disabled,
  "data-force": force,
  ...props
}: PhoneInputProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(a11y) => (
        <div
          data-force={force}
          aria-invalid={a11y["aria-invalid"]}
          className={cn(
            "flex min-h-touch w-full items-stretch overflow-hidden rounded-control border border-border bg-surface transition-colors hover:border-ink-quiet focus-within:border-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand aria-invalid:border-danger",
            disabled && "cursor-not-allowed bg-surface-alt opacity-60",
          )}
        >
          <span
            className="flex items-center border-r border-border bg-surface-alt px-3 text-base text-ink-quiet"
            aria-hidden
          >
            {brand.locale.phoneCountryCode}
          </span>
          <input
            data-slot="phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            disabled={disabled}
            aria-required={!optional || undefined}
            className="min-w-0 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink-quiet focus-visible:outline-none disabled:cursor-not-allowed"
            {...a11y}
            {...props}
          />
        </div>
      )}
    </Field>
  );
}

export { PhoneInput };
export type { PhoneInputProps };
