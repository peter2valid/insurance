"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";

/** Step names for the whole journey, given once by the page (see StepNames). */
const StepNamesContext = React.createContext<readonly string[] | undefined>(undefined);

/** Wrap a flow page so its StepHeader can show named steps. */
export function StepNames({ names, children }: { names?: readonly string[]; children: React.ReactNode }) {
  return <StepNamesContext.Provider value={names}>{children}</StepNamesContext.Provider>;
}

export function useStepNames() {
  return React.useContext(StepNamesContext);
}

/**
 * Named steps as numbered circles on a line: done steps are ticked, the
 * current one is ringed and named. On arrival the line grows into the
 * current step (instantly with reduced motion). Phones show the current
 * name under the line; wider screens name every step.
 */
export function StepTrack({ current, names }: { current: number; names: readonly string[] }) {
  const [arrived, setArrived] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setArrived(true));
    return () => cancelAnimationFrame(frame);
  }, [current]);

  return (
    <nav aria-label={kit.progress}>
      <ol className="flex items-start">
        {names.map((name, index) => {
          const number = index + 1;
          const done = number < current;
          const isCurrent = number === current;
          // The segment leading into the current step is the one that grows.
          const filled = number <= current;
          const growing = number === current && number > 1;
          return (
            <li
              key={name}
              aria-current={isCurrent ? "step" : undefined}
              className="relative flex flex-1 flex-col items-center gap-2"
            >
              {number > 1 && (
                <span className="absolute top-3.5 right-1/2 -left-1/2 h-0.5 bg-border" aria-hidden>
                  <span
                    className={cn(
                      "block h-full w-full origin-left bg-brand transition-transform duration-500 ease-out motion-reduce:transition-none",
                      filled && (!growing || arrived) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              )}
              <span
                className={cn(
                  "relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-300",
                  done && "border-brand bg-brand text-on-brand",
                  isCurrent && "border-brand bg-surface text-brand",
                  !done && !isCurrent && "border-border bg-surface text-ink-quiet",
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : number}
              </span>
              <span
                className={cn(
                  "hidden max-w-24 text-center text-xs sm:block",
                  isCurrent ? "font-semibold text-ink" : "text-ink-quiet",
                )}
              >
                {name}
                {done && <span className="sr-only"> ({kit.stepDone})</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="pt-2 text-sm font-semibold text-ink sm:hidden">{names[current - 1]}</p>
    </nav>
  );
}

/** StepHeader's progress: named steps when the page gave names, else a plain bar. */
export function StepProgress({ current, total, fallback }: { current: number; total: number; fallback: React.ReactNode }) {
  const names = useStepNames();
  if (!names || names.length !== total) return <>{fallback}</>;
  return <StepTrack current={current} names={names} />;
}
