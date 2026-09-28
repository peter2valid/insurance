import * as React from "react";
import { cn } from "@/lib/utils";
import { Field, controlClass } from "./field";

type InputProps = Omit<React.ComponentProps<"input">, "children"> & {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  hideLabel?: boolean;
};

/** Text input with label, hint and error. Works with React Hook Form's register(). */
function Input({
  id,
  label,
  hint,
  error,
  optional,
  hideLabel,
  className,
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
      {(a11y) => (
        <input
          data-slot="input"
          className={cn(controlClass)}
          aria-required={!optional || undefined}
          {...a11y}
          {...props}
        />
      )}
    </Field>
  );
}

export { Input };
export type { InputProps };
