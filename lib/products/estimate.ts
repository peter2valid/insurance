import { getQuoteProvider } from "@/lib/data/quote-provider";
import type { Application } from "@/lib/data/types";

/**
 * Instant price estimate shown to the client as soon as they apply: the
 * range of the QuoteProvider's suggestions. SIMULATED fixture prices today;
 * always labelled as an estimate, with final prices after documents are
 * checked (CLAUDE.md §2 honesty rules).
 */
export type Estimate = { min: number; max: number; perTrip: boolean };

export async function estimateFor(app: Application): Promise<Estimate | null> {
  const suggestions = await getQuoteProvider().suggest(app);
  const premiums = suggestions.map((quote) => quote.premiumKes).filter((n) => n > 0);
  if (premiums.length === 0) return null;
  return { min: Math.min(...premiums), max: Math.max(...premiums), perTrip: app.product === "travel" };
}
