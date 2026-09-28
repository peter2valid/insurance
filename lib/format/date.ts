import { brand } from "@/lib/brand";

/** Day-month-year, Nairobi time (CLAUDE.md §9). */
const dateFormat = new Intl.DateTimeFormat(brand.locale.language, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: brand.locale.timeZone,
});

const dateTimeFormat = new Intl.DateTimeFormat(brand.locale.language, {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: brand.locale.timeZone,
});

const relative = new Intl.RelativeTimeFormat(brand.locale.language, { numeric: "auto", style: "short" });

/** "28 Sept 2026" */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** "28 Sept, 10:40" */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** "4 min ago", "2 hr ago", "yesterday". Locale-aware, so Swahili later is free. */
export function formatAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return relative.format(Math.round(seconds), "second");
  if (abs < 3600) return relative.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), "hour");
  return relative.format(Math.round(seconds / 86400), "day");
}

/**
 * The request's "now" for Server Components (which render once per request,
 * so reading the clock is safe there). Pass it down so every "ago" on a page
 * agrees.
 */
export function requestTime(): number {
  return Date.now();
}
