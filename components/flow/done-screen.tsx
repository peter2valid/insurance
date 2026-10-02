import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed } from "lucide-react";
import { MinimalHeader } from "@/components/site/minimal-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { EstimateCard } from "@/components/status/estimate-card";
import { flow } from "@/lib/copy";
import type { Estimate } from "@/lib/products/estimate";

/**
 * Confirmation after sending: the reference, what happens next, and the
 * link to the status page (CLAUDE.md §8.1 step 6). One primary action.
 */
export function DoneScreen({
  refValue,
  stillNeeded,
  estimate,
}: {
  refValue: string;
  stillNeeded: string[];
  estimate?: Estimate | null;
}) {
  const copy = flow.done;

  return (
    <>
      <MinimalHeader helpLabel={flow.help} helpMessage={flow.helpMessageWithRef(refValue, copy.title)} />
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-6 px-4 py-6 md:py-12">
        <div className="flex flex-col gap-3">
          <CircleCheck className="size-12 text-success" aria-hidden />
          <h1 className="text-2xl md:text-3xl">{copy.title}</h1>
          <p className="text-lg font-medium text-ink">{copy.reference(refValue)}</p>
          <p className="max-w-prose text-base text-ink-quiet">{copy.body}</p>
          <p className="max-w-prose text-sm text-ink-quiet">{copy.demoNote}</p>
        </div>

        {estimate && <EstimateCard estimate={estimate} />}

        <Card className="gap-3">
          <h2 className="font-sans text-lg font-semibold">{copy.nextHeading}</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-base text-ink">
            {copy.next.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </Card>

        {stillNeeded.length > 0 && (
          <Card tone="alt" className="gap-3">
            <p className="text-base font-medium text-ink">{copy.stillNeeded}</p>
            <ul className="flex flex-col gap-2">
              {stillNeeded.map((doc) => (
                <li key={doc} className="flex items-center gap-2 text-base text-ink">
                  <CircleDashed className="size-5 shrink-0 text-warn" aria-hidden />
                  {doc}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Button asChild>
            <Link href={`/my/${refValue}`}>
              {copy.action}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <TextLink href="/" standalone>
            {copy.home}
          </TextLink>
        </div>
      </main>
    </>
  );
}
