"use client";

import * as React from "react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { Field } from "./field";

type OtpInputProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are entered. */
  onComplete?: (value: string) => void;
  length?: number;
  hint?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  "data-force"?: string;
};

/**
 * One-time code. A single real input (so paste and SMS autofill work)
 * sits over the digit boxes, which are purely visual.
 */
function OtpInput({
  id,
  label,
  value,
  onChange,
  onComplete,
  length = 6,
  hint,
  error,
  disabled,
  autoFocus,
  className,
  "data-force": force,
}: OtpInputProps) {
  const [focused, setFocused] = React.useState(false);
  const showFocus = focused || force?.includes("focus");
  const activeIndex = Math.min(value.length, length - 1);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/\D/g, "").slice(0, length);
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  return (
    <Field
      id={id}
      label={label}
      hint={hint ?? kit.otp.hint(length)}
      error={error}
      className={className}
    >
      {(a11y) => (
        <div className={cn("relative flex gap-2", disabled && "opacity-60")}>
          {Array.from({ length }, (_, index) => {
            const digit = value[index];
            const isActive = showFocus && index === activeIndex;
            return (
              <span
                key={index}
                aria-hidden
                className={cn(
                  "flex h-12 min-w-0 flex-1 items-center justify-center rounded-control border bg-surface text-xl font-medium text-ink transition-colors sm:max-w-12",
                  error ? "border-danger" : "border-border",
                  isActive && "border-brand outline-2 outline-offset-2 outline-brand",
                  disabled && "bg-surface-alt",
                )}
              >
                {digit}
              </span>
            );
          })}
          <input
            data-slot="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={length}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-required
            className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent focus-visible:outline-none disabled:cursor-not-allowed"
            {...a11y}
          />
        </div>
      )}
    </Field>
  );
}

export { OtpInput };
export type { OtpInputProps };
