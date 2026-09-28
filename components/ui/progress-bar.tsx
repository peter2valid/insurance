import { Progress } from "radix-ui";
import { cn } from "@/lib/utils";

/*
 * Internal building block for StepHeader and FileUpload.
 * Not used directly by screens.
 */
function ProgressBar({
  value,
  label,
  className,
}: {
  /** 0–100 */
  value: number;
  label: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Progress.Root
      value={clamped}
      aria-label={label}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-surface-alt", className)}
    >
      <Progress.Indicator
        className="h-full w-full bg-brand transition-transform"
        // Computed value: the only inline style the kit allows.
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </Progress.Root>
  );
}

export { ProgressBar };
