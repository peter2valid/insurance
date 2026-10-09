import * as React from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldError } from "./field";

type ChoiceOption = { value: string; label: string; description?: string; icon?: LucideIcon };

type ChoiceCardsProps = {
  name: string;
  /** The question. Rendered as the fieldset legend. */
  label: string;
  hideLabel?: boolean;
  options: readonly ChoiceOption[];
  /** One value, or several (comma-separated or an array) when `multiple`. */
  defaultValue?: string | readonly string[];
  /** Pick several (checkboxes) instead of one (radios). */
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
  /** "tiles": a grid of compact cards with an icon — for picking one of many at a glance. */
  layout?: "list" | "tiles";
  className?: string;
};

/**
 * Pick one (or several, with `multiple`) of a few options, each explained in
 * a sentence. Native radio/checkbox inputs, so keyboard, screen readers and
 * forms all just work; the whole card is the touch target.
 */
function ChoiceCards({
  name,
  label,
  hideLabel,
  options,
  defaultValue,
  multiple,
  error,
  disabled,
  layout = "list",
  className,
}: ChoiceCardsProps) {
  const errorId = React.useId();
  const selected = Array.isArray(defaultValue)
    ? defaultValue
    : typeof defaultValue === "string"
      ? defaultValue.split(",").filter(Boolean)
      : [];

  return (
    <fieldset
      className={cn("flex flex-col gap-3", className)}
      aria-describedby={error ? errorId : undefined}
      disabled={disabled}
    >
      <legend className={cn("pb-2 text-base font-medium text-ink", hideLabel && "sr-only")}>{label}</legend>
      {layout === "tiles" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                data-slot="choice-tile"
                className={cn(
                  "relative flex min-h-touch cursor-pointer flex-col gap-2 rounded-card border bg-surface p-3 transition-colors hover:border-brand has-checked:border-brand has-checked:bg-surface-alt has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand has-disabled:cursor-not-allowed has-disabled:opacity-60",
                  error ? "border-danger" : "border-border",
                )}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={name}
                  value={option.value}
                  defaultChecked={selected.includes(option.value)}
                  className="peer sr-only"
                />
                {/* Chosen: a tick as well as the border, so colour isn't the only signal. */}
                <span className="absolute top-2 right-2 hidden size-5 items-center justify-center rounded-full bg-brand text-on-brand peer-checked:flex">
                  <Check className="size-3" aria-hidden />
                </span>
                {Icon && <Icon className="size-6 text-brand" aria-hidden />}
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-ink">{option.label}</span>
                  {option.description && <span className="text-xs text-ink-quiet">{option.description}</span>}
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        options.map((option) => (
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
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={option.value}
              defaultChecked={selected.includes(option.value)}
              className="size-5 accent-brand"
            />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-medium text-ink">{option.label}</span>
            {option.description && <span className="text-sm text-ink-quiet">{option.description}</span>}
          </span>
        </label>
        ))
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

export { ChoiceCards };
export type { ChoiceCardsProps, ChoiceOption };
