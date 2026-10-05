import { peopleCovered } from "@/lib/products/summary";
import { insurers, LEVIES, MONTHLY_FACTOR, type Insurer } from "./insurers";
import { isVehicleCategory, periodOf, type VehicleCategory } from "./motor";
import type { Application, Quote, QuoteBreakdown } from "./types";

/**
 * QuoteProvider (CLAUDE.md §2): where quotes come from.
 * SIMULATED: prices every insurer on the panel from its SAMPLE rate card
 * (lib/data/insurers.ts) and adds the statutory levies. Later an insurer
 * API or rating engine implements the same interface.
 */
export type QuoteDraft = Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">;

export interface QuoteProvider {
  suggest(application: Application): Promise<QuoteDraft[]>;
}

const round100 = (n: number) => Math.round(n / 100) * 100;
const num = (value: string | undefined, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Basic premium plus training levy, PHCF and stamp duty. */
export function withLevies(basicKes: number): { totalKes: number; breakdown: QuoteBreakdown } {
  const basic = Math.round(basicKes);
  const trainingLevyKes = Math.round(basic * LEVIES.trainingLevy);
  const phcfKes = Math.round(basic * LEVIES.phcf);
  const breakdown = { basicKes: basic, trainingLevyKes, phcfKes, stampDutyKes: LEVIES.stampDuty };
  return { totalKes: basic + trainingLevyKes + phcfKes + LEVIES.stampDuty, breakdown };
}

function motorQuote(insurer: Insurer, app: Application): QuoteDraft {
  const d = app.details;
  const category: VehicleCategory = isVehicleCategory(d.category) ? d.category : "private";
  const card = insurer.motor[category];
  const coverType = d.coverType ?? "comprehensive";
  const value = num(d.vehicleValueKes);

  let basic: number;
  let excess: number | undefined;
  if (coverType === "third_party") {
    basic = card.thirdParty.base + (card.thirdParty.perSeat ?? 0) * num(d.seats, category === "psv_matatu" ? 14 : 0);
  } else {
    const { rate, minimum } = coverType === "comprehensive" ? card.comprehensive : card.tpft;
    basic = Math.max((value * rate) / 100, minimum);
    if (coverType === "comprehensive") excess = round100(Math.max((value * insurer.excess.rate) / 100, insurer.excess.minimum));
  }

  const period = periodOf(d);
  if (period === "monthly") basic *= MONTHLY_FACTOR;
  const { totalKes, breakdown } = withLevies(round100(basic));
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

/** Price every insurer on the panel, cheapest first. Sync, so seed data can use it. */
export function priceQuotes(application: Application): QuoteDraft[] {
  if (application.product === "motor") {
    return insurers.map((insurer) => motorQuote(insurer, application)).sort((a, b) => a.premiumKes - b.premiumKes);
  }
  const base = otherBase(application);
  return insurers
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
  async suggest(application) {
    return priceQuotes(application);
  },
};

export function getQuoteProvider(): QuoteProvider {
  return panelProvider;
}
