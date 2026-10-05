import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, controlClass } from "./field";

type InputProps = Omit<React.ComponentProps<"input">, "children" | "prefix"> & {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
  /** Text like "KES" or "+254", or an icon. */
  prefix?: React.ReactNode;
  "data-force"?: string;
};

/** Text input with label, hint, error and optional prefix. */
function Input({
  id,
  label,
  hint,
  error,
  optional,
  hideLabel,
  prefix,
  className,
  disabled,
  "data-force": force,
  ...props
}: InputProps) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      hideLabel={hideLabel}
      className={className}
    >
      {(a11y) =>
        prefix ? (
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
              {prefix}
            </span>
            <input
              data-slot="input"
              disabled={disabled}
              aria-required={!optional || undefined}
              className="min-w-0 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-ink-quiet focus-visible:outline-none disabled:cursor-not-allowed"
              {...a11y}
              {...props}
            />
          </div>
        ) : (
          <input
            data-slot="input"
            data-force={force}
            disabled={disabled}
            className={cn(controlClass)}
            aria-required={!optional || undefined}
            {...a11y}
            {...props}
          />
        )
      }
    </Field>
  );
}

export { Input };
export type { InputProps };
