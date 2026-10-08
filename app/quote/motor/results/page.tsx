import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuoteCompare } from "@/components/quote/quote-compare";
import { coverLabels, periodLabels, quote, vehicleCategoryLabels } from "@/lib/copy";
import { motorAddons, offersMonthly, type MotorAddon } from "@/lib/data/motor";
import { quoteMotor, type QuoteDraft } from "@/lib/data/quote-provider";
import { addonKey, fromSearchParams, parseMotorQuote, quoteFormHref } from "@/lib/flow/motor-quote";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";

export const metadata: Metadata = { title: quote.compare.pageTitle, robots: { index: false } };

/** Every combination of extras: [], [a], [b], [a, b]. */
function subsets(items: readonly MotorAddon[]): MotorAddon[][] {
  return items.reduce<MotorAddon[][]>((all, item) => all.concat(all.map((set) => [...set, item])), [[]]);
}

/**
 * Instant quotes, side by side. The address holds the answers; a link that
 * no longer checks out goes back to the form with what it had.
 */
export default async function MotorQuoteResultsPage(props: PageProps<"/quote/motor/results">) {
  const raw = fromSearchParams(await props.searchParams);
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  if (!parsed.ok) redirect(quoteFormHref(raw));
  const d = parsed.details;

  const offeredAddons = d.coverType === "comprehensive" ? motorAddons : [];
  const pricesByAddons: Record<string, QuoteDraft[]> = {};
  for (const set of subsets(offeredAddons)) {
    const key = addonKey(set);
    pricesByAddons[key] = quoteMotor({ ...d, addons: key }).quotes;
  }
  const declined = quoteMotor(d).declined.map((insurer) => ({ insurer: insurer.name, years: insurer.maxAgeComprehensive }));

  const summary = [
    `${d.make} ${d.year}`,
    vehicleCategoryLabels[d.category],
    coverLabels[d.coverType],
    d.vehicleValueKes ? formatKes(Number(d.vehicleValueKes)) : undefined,
    offersMonthly(d.category) ? periodLabels[d.period] : undefined,
    quote.compare.startsOn(formatDate(d.startDate)),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <QuoteCompare
      details={d}
      summary={summary}
      offeredAddons={offeredAddons}
      pricesByAddons={pricesByAddons}
      declined={declined}
    />
  );
}
