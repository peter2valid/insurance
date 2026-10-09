"use client";

import * as React from "react";
import { Check, CircleCheck, TrendingDown } from "lucide-react";
import { chooseCover } from "@/app/my/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { coverLabels, statusPage } from "@/lib/copy";
import { insurerByName } from "@/lib/data/insurers";
import type { Quote } from "@/lib/data/types";
import { formatExtras, formatKes, shownExcess } from "@/lib/format/money";

/**
 * The client's quotes, cheapest first, with the total they pay and how it
 * is made up (premium + statutory levies). When choosing is open, each has
 * a "Choose this cover" button; afterwards the chosen one is marked.
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
  // Only the tapped button shows it's working.
  const [choosing, setChoosing] = React.useState<string>();
  const copy = statusPage.quotes;
  const sorted = [...quotes].sort((a, b) => a.premiumKes - b.premiumKes);
  const coverLabel = (value: string) => coverLabels[value] ?? value;
  const periodLabel = (quote: Quote) =>
    perTrip ? copy.premiumForTrip : quote.period === "monthly" ? copy.premiumMonthly : copy.premium;

  return (
    <div className="flex flex-col gap-3">
      {errors._form && <FieldError>{errors._form}</FieldError>}
      <ul className="flex flex-col gap-3">
        {sorted.map((quote, index) => {
          const b = quote.breakdown;
          const levies = b ? b.trainingLevyKes + b.phcfKes + b.stampDutyKes : 0;
          return (
            <li key={quote.id}>
              <Card className={quote.chosen ? "gap-3 border-2 border-brand" : "gap-3"}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <Avatar name={quote.insurer} src={insurerByName(quote.insurer)?.logo} shape="logo" />
                    <div className="flex flex-col gap-1">
                      <h3 className="font-sans text-lg font-semibold">{quote.insurer}</h3>
                      <p className="text-sm text-ink-quiet">{coverLabel(quote.coverType)}</p>
                    </div>
                  </div>
                  {quote.chosen ? (
                    <StatusBadge tone="success" label={copy.chosen} icon={CircleCheck} />
                  ) : (
                    canChoose && index === 0 && sorted.length > 1 && <StatusBadge tone="new" label={copy.cheapest} icon={TrendingDown} />
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-2xl font-semibold text-ink">{formatKes(quote.premiumKes)}</p>
                  <p className="text-sm text-ink-quiet">
                    {periodLabel(quote)}
                    {shownExcess(quote) ? ` · ${copy.excess(formatKes(shownExcess(quote) ?? 0))}` : ""}
                  </p>
                  {b && <p className="text-xs text-ink-quiet">{copy.breakdown(formatKes(b.basicKes), formatKes(levies), formatExtras(b))}</p>}
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
                  <form action={formAction} onSubmit={() => setChoosing(quote.id)}>
                    <input type="hidden" name="ref" value={refValue} />
                    <input type="hidden" name="quoteId" value={quote.id} />
                    <Button
                      type="submit"
                      variant={index === 0 ? "primary" : "secondary"}
                      loading={pending && choosing === quote.id}
                      disabled={pending && choosing !== quote.id}
                      className="w-full sm:w-auto"
                    >
                      {copy.choose}
                    </Button>
                  </form>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-ink-quiet">{copy.placeholderNote}</p>
    </div>
  );
}
