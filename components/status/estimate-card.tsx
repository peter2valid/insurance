import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { statusPage } from "@/lib/copy";
import { formatKes } from "@/lib/format/money";
import type { Estimate } from "@/lib/products/estimate";

/** The client's instant price estimate — always labelled as an estimate. */
export function EstimateCard({ estimate }: { estimate: Estimate }) {
  const copy = statusPage.estimate;
  return (
    <Card className="gap-2">
      <p className="flex items-center gap-2 text-sm font-medium text-brand">
        <Sparkles className="size-4" aria-hidden />
        {copy.heading}
      </p>
      <p className="text-2xl font-semibold text-ink">
        {copy.range(formatKes(estimate.min), formatKes(estimate.max))}
      </p>
      <p className="text-sm text-ink-quiet">{estimate.perTrip ? copy.perTrip : copy.perYear}</p>
      <p className="max-w-prose text-sm text-ink-quiet">{copy.note}</p>
    </Card>
  );
}
