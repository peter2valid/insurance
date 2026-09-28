import type { Application, Quote } from "./types";

/**
 * QuoteProvider (CLAUDE.md §2): where quote suggestions come from.
 * SIMULATED: fixture rates today. Later: an insurer API or rating engine
 * (CLAUDE.md §12) implements the same interface.
 */
export type QuoteDraft = Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">;

export interface QuoteProvider {
  /** Suggested quotes the admin can review and send; never auto-sent. */
  suggest(application: Application): Promise<QuoteDraft[]>;
}

// Placeholders until real partners are confirmed. Never invent insurer names.
const INSURERS = ["[Insurer A]", "[Insurer B]", "[Insurer C]"];

// Illustrative fixture rates — not real market rates.
const RATES: Record<string, number[]> = {
  comprehensive: [0.04, 0.042, 0.0375],
  third_party_fire_theft: [0.025, 0.027, 0.024],
};
const THIRD_PARTY_FLAT_KES = [7_500, 8_000, 7_200];

const fixtureProvider: QuoteProvider = {
  async suggest(application) {
    const coverType = application.details.coverType ?? "comprehensive";
    const value = Number(application.details.vehicleValueKes ?? 0);

    return INSURERS.map((insurer, i) => {
      const premium =
        coverType === "third_party"
          ? THIRD_PARTY_FLAT_KES[i]
          : Math.max(Math.round((value * (RATES[coverType]?.[i] ?? 0.04)) / 100) * 100, 15_000);
      return {
        insurer,
        coverType,
        premiumKes: premium,
        excessKes: coverType === "third_party" ? undefined : [15_000, 20_000, 10_000][i],
        benefits: [],
      };
    });
  },
};

export function getQuoteProvider(): QuoteProvider {
  return fixtureProvider;
}
