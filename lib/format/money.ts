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
