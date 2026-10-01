import { peopleCovered } from "@/lib/products/summary";
import type { Application, Quote } from "./types";

/**
 * QuoteProvider (CLAUDE.md §2): where quote suggestions come from.
 * SIMULATED: fixture rates per product. Later an insurer API or rating
 * engine (CLAUDE.md §12) implements the same interface. Suggestions only
 * pre-fill the admin's "Add quote" form — nothing is sent automatically.
 */
export type QuoteDraft = Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">;

export interface QuoteProvider {
  suggest(application: Application): Promise<QuoteDraft[]>;
}

// Placeholders until real partners are confirmed. Never invent insurer names.
const INSURERS = ["[Insurer A]", "[Insurer B]", "[Insurer C]"];
// Each insurer is a little cheaper or dearer than the base price.
const SPREAD = [1, 1.05, 0.94];

const round100 = (n: number) => Math.round(n / 100) * 100;
const num = (value: string | undefined, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/** Illustrative fixture prices — NOT real market rates. */
function basePrice(app: Application): { coverType: string; premium: number; excess?: number } {
  const d = app.details;
  switch (app.product) {
    case "motor": {
      const coverType = d.coverType ?? "comprehensive";
      if (coverType === "third_party") return { coverType, premium: 7_500 };
      const rate = coverType === "comprehensive" ? 0.04 : 0.025;
      return { coverType, premium: Math.max(num(d.vehicleValueKes) * rate, 15_000), excess: 15_000 };
    }
    case "health": {
      const age = num(d.principalAge, 30);
      const ageFactor = age <= 35 ? 1 : age <= 50 ? 1.4 : age <= 65 ? 2.2 : 3;
      const planFactor = d.plan === "full" ? 2.1 : d.plan === "inpatient_outpatient" ? 1.6 : 1;
      const limit = num(d.limit, 1_000_000);
      const limitFactor = limit <= 500_000 ? 0.7 : limit <= 1_000_000 ? 1 : limit <= 2_000_000 ? 1.35 : 1.9;
      const people = peopleCovered(d);
      const memberFactor = 1 + (people - 1) * 0.55;
      return { coverType: d.plan ?? "inpatient", premium: 22_000 * ageFactor * planFactor * limitFactor * memberFactor };
    }
    case "travel": {
      const perDay: Record<string, number> = {
        africa: 150,
        asia: 200,
        middle_east: 200,
        schengen: 280,
        uk: 300,
        usa_canada: 450,
        worldwide: 500,
      };
      const days = Math.max(1, Math.round((Date.parse(d.returnDate) - Date.parse(d.departDate)) / 86_400_000) || 7);
      const ageFactor = num(d.oldestAge, 30) > 65 ? 2 : 1;
      const premium = Math.max(days * (perDay[d.region] ?? 300) * num(d.travellers, 1) * ageFactor, 1_500);
      return { coverType: "standard", premium };
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
      return { coverType: "package", premium: Math.max(premium, 10_000), excess: 10_000 };
    }
  }
}

const fixtureProvider: QuoteProvider = {
  async suggest(application) {
    const base = basePrice(application);
    return INSURERS.map((insurer, i) => ({
      insurer,
      coverType: base.coverType,
      premiumKes: round100(base.premium * SPREAD[i]),
      excessKes: base.excess ? round100(base.excess * [1, 1.3, 0.7][i]) : undefined,
      benefits: [],
    }));
  },
};

export function getQuoteProvider(): QuoteProvider {
  return fixtureProvider;
}
