import { brand } from "@/lib/brand";

const kes = new Intl.NumberFormat(brand.locale.language, {
  style: "currency",
  currency: brand.locale.currency,
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

/** 45000 -> "KES 45,000" */
export function formatKes(amount: number): string {
  return kes.format(amount);
}

/** Total of paid extras on a quote, if any ("KES 5,500"). */
export function formatExtras(breakdown: { addons?: { kes: number }[] }): string | undefined {
  const kes = (breakdown.addons ?? []).reduce((sum, addon) => sum + addon.kes, 0);
  return kes > 0 ? formatKes(kes) : undefined;
}

/** The excess to show on a quote: none when the excess protector was added. */
export function shownExcess(quote: { excessKes?: number; breakdown?: { addons?: { id: string }[] } }): number | undefined {
  return quote.breakdown?.addons?.some((addon) => addon.id === "excess_protector") ? undefined : quote.excessKes;
}
