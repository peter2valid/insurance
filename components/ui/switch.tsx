"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * On/off switch with its label and description. Inside a form it submits
 * `name=on` when on (Radix renders a hidden checkbox). The whole row is the
 * touch target; the state also shows as text, not colour alone.
 */
function Switch({
  name,
  label,
  description,
  defaultChecked,
  onLabel,
  offLabel,
  className,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  onLabel: string;
  offLabel: string;
  className?: string;
}) {
  const id = React.useId();
  const [checked, setChecked] = React.useState(Boolean(defaultChecked));
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <label htmlFor={id} className="flex flex-1 cursor-pointer flex-col gap-1">
        <span className="text-base font-medium text-ink">{label}</span>
        {description && <span className="text-sm text-ink-quiet">{description}</span>}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm text-ink-quiet" aria-hidden>
          {checked ? onLabel : offLabel}
        </span>
        <SwitchPrimitive.Root
          id={id}
          name={name}
          checked={checked}
          onCheckedChange={setChecked}
          className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-border transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand data-[state=checked]:bg-brand"
        >
          <SwitchPrimitive.Thumb className="pointer-events-none block size-6 rounded-full bg-surface shadow-raised transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 motion-reduce:transition-none" />
        </SwitchPrimitive.Root>
      </div>
    </div>
  );
}

export { Switch };
