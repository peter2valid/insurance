import * as React from "react";
import { ChevronDown } from "lucide-react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { Field, controlClass } from "./field";

type SelectOption = { value: string; label: string };

type SelectProps = Omit<React.ComponentProps<"select">, "children"> & {
  label: string;
  options: readonly SelectOption[];
  placeholder?: string;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
};

/*
 * Native <select> on purpose: on phones it opens the system picker, which
 * is faster and more familiar than a custom dropdown, and it works with
 * React Hook Form's register() out of the box.
 */
function Select({
  id,
  label,
  options,
  placeholder = kit.select.placeholder,
  hint,
  error,
  optional,
  className,
  defaultValue,
  value,
  ...props
}: SelectProps) {
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
        <div className="relative">
          <select
            data-slot="select"
            className={cn(controlClass, "appearance-none pr-12")}
            aria-required={!optional || undefined}
            value={value}
            defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
            {...a11y}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-ink-quiet"
            aria-hidden
          />
        </div>
      )}
    </Field>
  );
}

export { Select };
export type { SelectProps, SelectOption };
