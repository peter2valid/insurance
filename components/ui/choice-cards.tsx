import * as React from "react";
import { cn } from "@/lib/utils";
import { FieldError } from "./field";

type ChoiceOption = { value: string; label: string; description?: string };

type ChoiceCardsProps = {
  name: string;
  /** The question. Rendered as the fieldset legend. */
  label: string;
  hideLabel?: boolean;
  options: readonly ChoiceOption[];
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Pick one of a few options, each explained in a sentence. Native radio
 * inputs (keyboard arrows, screen readers and forms all just work); the
 * whole card is the touch target.
 */
function ChoiceCards({
  name,
  label,
  hideLabel,
  options,
  defaultValue,
  error,
  disabled,
  className,
}: ChoiceCardsProps) {
  const errorId = React.useId();

  return (
    <fieldset
      className={cn("flex flex-col gap-3", className)}
      aria-describedby={error ? errorId : undefined}
      disabled={disabled}
    >
      <legend className={cn("pb-2 text-base font-medium text-ink", hideLabel && "sr-only")}>{label}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          data-slot="choice-card"
          className={cn(
            "flex min-h-touch cursor-pointer items-start gap-3 rounded-card border bg-surface p-4 transition-colors hover:border-brand has-checked:border-brand has-checked:bg-surface-alt has-disabled:cursor-not-allowed has-disabled:opacity-60",
            error ? "border-danger" : "border-border",
          )}
        >
          <span className="flex h-6 shrink-0 items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={defaultValue === option.value}
              className="size-5 accent-brand"
            />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-medium text-ink">{option.label}</span>
            {option.description && <span className="text-sm text-ink-quiet">{option.description}</span>}
          </span>
        </label>
      ))}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

export { ChoiceCards };
export type { ChoiceCardsProps, ChoiceOption };
