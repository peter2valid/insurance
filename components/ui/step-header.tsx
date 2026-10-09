import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { kit } from "@/lib/copy";
import { Button } from "./button";
import { ProgressBar } from "./progress-bar";
import { StepProgress } from "./step-track";

type StepHeaderProps = {
  current: number;
  total: number;
  /** Link back (preferred), or a handler if going back is not a route change. */
  backHref?: string;
  onBack?: () => void;
  backLabel?: string;
};

/** "Step 2 of 5" with a back control, and named steps (inside StepNames) or a progress bar. */
function StepHeader({
  current,
  total,
  backHref,
  onBack,
  backLabel = kit.back,
}: StepHeaderProps) {
  const stepText = kit.step(current, total);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-touch items-center gap-2">
        {backHref ? (
          <Button asChild variant="ghost" className="-ml-3 px-3">
            <Link href={backHref}>
              <ChevronLeft aria-hidden />
              {backLabel}
            </Link>
          </Button>
        ) : onBack ? (
          <Button variant="ghost" className="-ml-3 px-3" onClick={onBack}>
            <ChevronLeft aria-hidden />
            {backLabel}
          </Button>
        ) : null}
        <p className="ml-auto text-sm text-ink-quiet" aria-live="polite">
          {stepText}
        </p>
      </div>
      <StepProgress current={current} total={total} fallback={<ProgressBar value={(current / total) * 100} label={stepText} />} />
    </div>
  );
}

export { StepHeader };
export type { StepHeaderProps };
