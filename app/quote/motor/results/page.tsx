import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuoteCompare, type InsurerExtras } from "@/components/quote/quote-compare";
import { StepNames } from "@/components/ui/step-track";
import { coverLabels, flow, periodLabels, quote } from "@/lib/copy";
import { insurerByName } from "@/lib/data/insurers";
import { addonsFor, isPsv, offersMonthly, type MotorAddon } from "@/lib/data/motor";
import { needsTracker, quoteMotor, type QuoteDraft } from "@/lib/data/quote-provider";
import { getRepo } from "@/lib/data/repo";
import { addonCopy, addonKey, fromSearchParams, motorClassLabel, parseMotorQuote, quoteFormHref } from "@/lib/flow/motor-quote";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";

export const metadata: Metadata = { title: quote.compare.pageTitle, robots: { index: false } };

/** Every combination of extras: [], [a], [b], [a, b], … */
function subsets(items: readonly MotorAddon[]): MotorAddon[][] {
  return items.reduce<MotorAddon[][]>((all, item) => all.concat(all.map((set) => [...set, item])), [[]]);
}

/** What an agent would tell the client about this kind of cover before they buy. */
function goodToKnow(d: Record<string, string>): string[] {
  const n = quote.compare.notes;
  const notes: (string | undefined)[] = [
    d.coverType === "comprehensive" ? n.valuation : n.thirdParty,
    d.category === "psv_matatu" ? n.psv : undefined,
    d.category === "motorcycle" ? n.boda : undefined,
    d.category === "general_cartage" ? n.cartage : undefined,
    d.category === "car_hire" ? n.carHire : undefined,
    d.period === "monthly" && isPsv(d.category) ? n.monthly : undefined,
  ];
  return notes.filter((note): note is string => Boolean(note));
}

/**
 * Instant quotes, side by side, from the insurers on the broker's panel.
 * The address holds the answers; a link that no longer checks out goes
 * back to the form with what it had.
 */
export default async function MotorQuoteResultsPage(props: PageProps<"/quote/motor/results">) {
  const raw = fromSearchParams(await props.searchParams);
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  if (!parsed.ok) redirect(quoteFormHref(raw));
  const d = parsed.details;
  const { panel } = await getRepo().getSettings();

  const offeredAddons = addonsFor(d.category, d.coverType);
  const pricesByAddons: Record<string, QuoteDraft[]> = {};
  for (const set of subsets(offeredAddons)) {
    const key = addonKey(set);
    pricesByAddons[key] = quoteMotor({ ...d, addons: key }, panel).quotes;
  }
  const declined = quoteMotor(d, panel).declined.map((insurer) => ({ insurer: insurer.name, years: insurer.maxAgeComprehensive }));

  const extras: Record<string, InsurerExtras> = {};
  for (const offer of pricesByAddons[""] ?? []) {
    const insurer = insurerByName(offer.insurer);
    if (insurer) extras[insurer.name] = { logo: insurer.logo, tracker: needsTracker(insurer, d) };
  }

  const summary = [
    [d.make === "Other" ? undefined : d.make, d.year].filter(Boolean).join(" "),
    motorClassLabel(d),
    coverLabels[d.coverType],
    d.vehicleValueKes ? formatKes(Number(d.vehicleValueKes)) : undefined,
    offersMonthly(d.category) ? periodLabels[d.period] : undefined,
    quote.compare.startsOn(formatDate(d.startDate)),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StepNames names={flow.journeySteps.motor}>
    <QuoteCompare
      details={d}
      summary={summary}
      addons={offeredAddons.map((addon) => ({ value: addon, ...addonCopy(addon, d.category) }))}
      pricesByAddons={pricesByAddons}
      extras={extras}
      notes={goodToKnow(d)}
      declined={declined}
    />
    </StepNames>
  );
}
