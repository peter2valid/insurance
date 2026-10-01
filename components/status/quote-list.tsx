"use client";

import { Check, CircleCheck } from "lucide-react";
import { chooseCover } from "@/app/my/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { coverLabels, statusPage } from "@/lib/copy";
import type { Quote } from "@/lib/data/types";
import { formatKes } from "@/lib/format/money";

/**
 * The client's quotes, cheapest first. When choosing is open, each has a
 * "Choose this cover" button; afterwards the chosen one is marked.
 */
export function QuoteList({
  refValue,
  quotes,
  canChoose,
  perTrip = false,
}: {
  refValue: string;
  quotes: Quote[];
  canChoose: boolean;
  /** Travel quotes are for one trip, not a year. */
  perTrip?: boolean;
}) {
  const { formAction, pending, errors } = useFlowAction(chooseCover);
  const copy = statusPage.quotes;
  const sorted = [...quotes].sort((a, b) => a.premiumKes - b.premiumKes);
  const coverLabel = (value: string) => coverLabels[value] ?? value;

  return (
    <div className="flex flex-col gap-3">
      {errors._form && <FieldError>{errors._form}</FieldError>}
      <ul className="flex flex-col gap-3">
        {sorted.map((quote) => (
          <li key={quote.id}>
            <Card className={quote.chosen ? "gap-3 border-2 border-brand" : "gap-3"}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-lg font-semibold">{quote.insurer}</h3>
                  <p className="text-sm text-ink-quiet">{coverLabel(quote.coverType)}</p>
                </div>
                {quote.chosen && <StatusBadge tone="success" label={copy.chosen} icon={CircleCheck} />}
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-semibold text-ink">{formatKes(quote.premiumKes)}</p>
                <p className="text-sm text-ink-quiet">
                  {perTrip ? copy.premiumForTrip : copy.premium}
                  {quote.excessKes ? ` · ${copy.excess(formatKes(quote.excessKes))}` : ""}
                </p>
              </div>
              {quote.benefits.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {quote.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
                      <span className="flex h-5 shrink-0 items-center">
                        <Check className="size-4 text-success" aria-hidden />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              )}
              {canChoose && (
                <form action={formAction}>
                  <input type="hidden" name="ref" value={refValue} />
                  <input type="hidden" name="quoteId" value={quote.id} />
                  <Button type="submit" variant="secondary" loading={pending} className="w-full sm:w-auto">
                    {copy.choose}
                  </Button>
                </form>
              )}
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-quiet">{copy.placeholderNote}</p>
    </div>
  );
}
