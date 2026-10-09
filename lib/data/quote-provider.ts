import { peopleCovered } from "@/lib/products/summary";
import { LEVIES, MONTHLY_FACTOR, panelInsurers, type Insurer } from "./insurers";
import { addonsOf, earnsIncome, isTonnageBand, isVehicleCategory, periodOf, vehicleAge, type MotorAddon, type VehicleCategory } from "./motor";
import type { Application, Quote, QuoteBreakdown } from "./types";

/**
 * QuoteProvider (CLAUDE.md §2): where quotes come from.
 * SIMULATED: prices every insurer on the panel from its SAMPLE rate card
 * (lib/data/insurers.ts) and adds the statutory levies. Later an insurer
 * API or rating engine implements the same interface.
 */
export type QuoteDraft = Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">;

export interface QuoteProvider {
  /** `panel`: the insurer ids the broker has switched on (Settings.panel). */
  suggest(application: Application, panel?: readonly string[]): Promise<QuoteDraft[]>;
}

const round100 = (n: number) => Math.round(n / 100) * 100;
const num = (value: string | undefined, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Basic premium (plus any extras) with training levy, PHCF and stamp duty. */
export function withLevies(
  basicKes: number,
  addons: NonNullable<QuoteBreakdown["addons"]> = [],
): { totalKes: number; breakdown: QuoteBreakdown } {
  const basic = Math.round(basicKes);
  const extras = addons.reduce((sum, addon) => sum + addon.kes, 0);
  const levied = basic + extras;
  const trainingLevyKes = Math.round(levied * LEVIES.trainingLevy);
  const phcfKes = Math.round(levied * LEVIES.phcf);
  const breakdown: QuoteBreakdown = {
    basicKes: basic,
    ...(addons.length > 0 && { addons }),
    trainingLevyKes,
    phcfKes,
    stampDutyKes: LEVIES.stampDuty,
  };
  return { totalKes: levied + trainingLevyKes + phcfKes + LEVIES.stampDuty, breakdown };
}

/** Does this insurer take this class of vehicle at all? (Sample: see Insurer.accepts.) */
export function acceptsClass(insurer: Insurer, details: Record<string, string>): boolean {
  return !isVehicleCategory(details.category) || insurer.accepts.includes(details.category);
}

/** Within the insurer's age limit for comprehensive cover? */
export function withinAgeLimit(insurer: Insurer, details: Record<string, string>): boolean {
  if (details.coverType !== "comprehensive") return true;
  const age = vehicleAge(details.year);
  return age === undefined || age <= insurer.maxAgeComprehensive;
}

/** Will this insurer quote this vehicle and cover? */
export function coversVehicle(insurer: Insurer, details: Record<string, string>): boolean {
  return acceptsClass(insurer, details) && withinAgeLimit(insurer, details);
}

/** Comprehensive above the insurer's limit needs an approved tracking device. */
export function needsTracker(insurer: Insurer, details: Record<string, string>): boolean {
  return details.coverType === "comprehensive" && num(details.vehicleValueKes) > insurer.trackerAbove;
}

/**
 * Price of one add-on with this insurer, for this vehicle. Loss of use pays
 * a daily amount for longer when the vehicle earns money, so it costs more.
 */
export function addonPrice(
  insurer: Insurer,
  addon: MotorAddon,
  valueKes: number,
  category?: string,
): { kes: number; included: boolean } {
  const rate = insurer.addons[addon];
  if ("included" in rate) return { kes: 0, included: true };
  if ("flat" in rate) return { kes: round100(addon === "loss_of_use" && earnsIncome(category) ? rate.flat * 2 : rate.flat), included: false };
  return { kes: round100(Math.max((valueKes * rate.rate) / 100, rate.minimum)), included: false };
}

function motorQuote(insurer: Insurer, d: Record<string, string>): QuoteDraft {
  const category: VehicleCategory = isVehicleCategory(d.category) ? d.category : "private";
  const card = insurer.motor[category];
  const coverType = d.coverType ?? "comprehensive";
  const value = num(d.vehicleValueKes);

  let basic: number;
  let excess: number | undefined;
  if (coverType === "third_party") {
    const tp = card.thirdParty;
    const byWeight = tp.byTonnage && isTonnageBand(d.tonnage) ? tp.byTonnage[d.tonnage] : undefined;
    basic = (byWeight ?? tp.base) + (tp.perSeat ?? 0) * num(d.seats, category === "psv_matatu" ? 14 : 0);
  } else {
    const { rate, minimum } = coverType === "comprehensive" ? card.comprehensive : card.tpft;
    basic = Math.max((value * rate) / 100, minimum);
    if (coverType === "comprehensive") excess = round100(Math.max((value * insurer.excess.rate) / 100, insurer.excess.minimum));
  }

  const period = periodOf(d);
  if (period === "monthly") basic *= MONTHLY_FACTOR;
  // Extras are yearly covers; a month costs the same share as the premium.
  const addons = addonsOf(d).map((id) => {
    const price = addonPrice(insurer, id, value, category);
    return { id, kes: round100(period === "monthly" ? price.kes * MONTHLY_FACTOR : price.kes), ...(price.included && { included: true }) };
  });
  const { totalKes, breakdown } = withLevies(round100(basic), addons);
  return {
    insurer: insurer.name,
    coverType,
    premiumKes: totalKes,
    excessKes: excess,
    benefits: insurer.benefits[coverType as keyof Insurer["benefits"]] ?? [],
    breakdown,
    period,
  };
}

/** Illustrative fixture prices for health, travel and business — NOT real market rates. */
function otherBase(app: Application): { coverType: string; premium: number; excess?: number; benefits: string[] } {
  const d = app.details;
  switch (app.product) {
    case "health": {
      const age = num(d.principalAge, 30);
      const ageFactor = age <= 35 ? 1 : age <= 50 ? 1.4 : age <= 65 ? 2.2 : 3;
      const planFactor = d.plan === "full" ? 2.1 : d.plan === "inpatient_outpatient" ? 1.6 : 1;
      const limit = num(d.limit, 1_000_000);
      const limitFactor = limit <= 500_000 ? 0.7 : limit <= 1_000_000 ? 1 : limit <= 2_000_000 ? 1.35 : 1.9;
      const memberFactor = 1 + (peopleCovered(d) - 1) * 0.55;
      return {
        coverType: d.plan ?? "inpatient",
        premium: 22_000 * ageFactor * planFactor * limitFactor * memberFactor,
        benefits: ["Day-care procedures", "Ambulance cover", "Chronic conditions after 12 months"],
      };
    }
    case "travel": {
      const perDay: Record<string, number> = {
        africa: 150, asia: 200, middle_east: 200, schengen: 280, uk: 300, usa_canada: 450, worldwide: 500,
      };
      const days = Math.max(1, Math.round((Date.parse(d.returnDate) - Date.parse(d.departDate)) / 86_400_000) || 7);
      const ageFactor = num(d.oldestAge, 30) > 65 ? 2 : 1;
      return {
        coverType: "standard",
        premium: Math.max(days * (perDay[d.region] ?? 300) * num(d.travellers, 1) * ageFactor, 1_500),
        benefits: ["Emergency medical cover", "Lost luggage", "Trip cancellation"],
      };
    }
    case "business": {
      const covers = (d.covers ?? "").split(",");
      const value = num(d.contentsValueKes);
      let premium = 0;
      if (covers.includes("stock_contents") || covers.includes("building")) premium += value * 0.006;
      if (covers.includes("liability")) premium += 8_000;
      if (covers.includes("money")) premium += 3_000;
      if (covers.includes("employees")) premium += num(d.staffCount) * 2_500;
      if (covers.includes("transit")) premium += 4_000;
      return {
        coverType: "package",
        premium: Math.max(premium, 10_000),
        excess: 10_000,
        benefits: ["Fire and burglary", "Public liability up to KES 1,000,000"],
      };
    }
    default:
      return { coverType: "comprehensive", premium: 0, benefits: [] };
  }
}

/**
 * Motor quotes straight from answers (no application yet): the instant
 * quote page uses this. Insurers that don't cover the vehicle are listed
 * separately so the page can say why.
 */
export function quoteMotor(
  details: Record<string, string>,
  panel?: readonly string[],
): { quotes: QuoteDraft[]; declined: Insurer[] } {
  // Insurers that don't take this class at all aren't mentioned; age limits are explained.
  const taking = panelInsurers(panel).filter((insurer) => acceptsClass(insurer, details));
  const covering = taking.filter((insurer) => withinAgeLimit(insurer, details));
  return {
    quotes: covering.map((insurer) => motorQuote(insurer, details)).sort((a, b) => a.premiumKes - b.premiumKes),
    declined: taking.filter((insurer) => !covering.includes(insurer)),
  };
}

/** Price every insurer on the panel, cheapest first. Sync, so seed data can use it. */
export function priceQuotes(application: Application, panel?: readonly string[]): QuoteDraft[] {
  if (application.product === "motor") return quoteMotor(application.details, panel).quotes;
  const base = otherBase(application);
  return panelInsurers(panel)
    .map((insurer) => {
      const { totalKes, breakdown } = withLevies(round100(base.premium * insurer.otherFactor));
      return {
        insurer: insurer.name,
        coverType: base.coverType,
        premiumKes: totalKes,
        excessKes: base.excess ? round100(base.excess * insurer.otherFactor) : undefined,
        benefits: base.benefits,
        breakdown,
        period: "annual" as const,
      };
    })
    .sort((a, b) => a.premiumKes - b.premiumKes);
}

const panelProvider: QuoteProvider = {
  async suggest(application, panel) {
    // Lazy import: the repo's seed data imports this file.
    const chosen = panel ?? (await (await import("./repo")).getRepo().getSettings()).panel;
    return priceQuotes(application, chosen);
  },
};

export function getQuoteProvider(): QuoteProvider {
  return panelProvider;
}
