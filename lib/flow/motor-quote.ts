import { z } from "zod";
import { quote } from "@/lib/copy";
import {
  coversFor,
  isMotorAddon,
  motorAddons,
  motorCoverTypes,
  needsSeats,
  offersMonthly,
  OLDEST_YEAR,
  vehicleCategories,
} from "@/lib/data/motor";
import { todayIso } from "@/lib/format/date";

/**
 * The instant motor quote: which answers it takes, how they're checked,
 * and how they travel in the results page's address. The address holds the
 * whole quote, so Back, refresh and a shared link all show the same prices.
 */

export const quoteKeys = [
  "category",
  "seats",
  "coverType",
  "make",
  "year",
  "vehicleValueKes",
  "period",
  "startDate",
  "addons",
] as const;

export const MAX_START_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const errors = quote.form.errors;

const toNumber = (value: string | undefined) => Number((value ?? "").replace(/[,\s]/g, ""));

const schema = z
  .object({
    category: z.enum(vehicleCategories, { message: errors.category }),
    coverType: z.enum(motorCoverTypes, { message: errors.coverType }),
    make: z.string().trim().min(1, errors.make).max(40, errors.make),
    year: z.string(),
    seats: z.string().optional(),
    vehicleValueKes: z.string().optional(),
    period: z.string().optional(),
    startDate: z.string().optional(),
    addons: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    const year = Number(d.year);
    if (!Number.isInteger(year) || year < OLDEST_YEAR || year > new Date().getFullYear() + 1) issue("year", errors.year);
    if (!coversFor(d.category).includes(d.coverType)) issue("coverType", errors.coverType);
    if (needsSeats(d.category)) {
      const seats = toNumber(d.seats);
      if (!Number.isInteger(seats) || seats < 7 || seats > 90) issue("seats", errors.seats);
    }
    if (d.coverType !== "third_party") {
      const value = toNumber(d.vehicleValueKes);
      if (!Number.isFinite(value) || value < 50_000 || value > 50_000_000) issue("vehicleValueKes", errors.value);
    }
    if (offersMonthly(d.category) && d.period !== "annual" && d.period !== "monthly") issue("period", errors.period);
  });

export type QuoteResult = { ok: true; details: Record<string, string> } | { ok: false; errors: Record<string, string> };

/**
 * Check a quote's answers and return them cleaned (answers that don't apply
 * are emptied). `staleStartIsToday`: an old results link whose start date
 * has passed starts today instead of failing.
 */
export function parseMotorQuote(
  raw: Record<string, string | undefined>,
  { staleStartIsToday = false, now = Date.now() }: { staleStartIsToday?: boolean; now?: number } = {},
): QuoteResult {
  const parsed = schema.safeParse(raw);
  const found: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_form");
      found[key] ??= issue.message;
    }
  }

  const today = todayIso(now);
  let startDate = raw.startDate || today;
  if (startDate < today && staleStartIsToday) startDate = today;
  const days = (Date.parse(startDate) - Date.parse(today)) / DAY_MS;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !(days >= 0 && days <= MAX_START_DAYS)) found.startDate ??= errors.startDate;

  if (!parsed.success || Object.keys(found).length > 0) return { ok: false, errors: found };

  const d = parsed.data;
  const comprehensive = d.coverType === "comprehensive";
  return {
    ok: true,
    details: {
      category: d.category,
      seats: needsSeats(d.category) ? String(toNumber(d.seats)) : "",
      coverType: d.coverType,
      make: d.make,
      year: d.year,
      vehicleValueKes: d.coverType === "third_party" ? "" : String(Math.round(toNumber(d.vehicleValueKes))),
      period: offersMonthly(d.category) ? (d.period ?? "annual") : "",
      startDate,
      addons: comprehensive ? addonKey((d.addons ?? "").split(",").filter(isMotorAddon)) : "",
    },
  };
}

/** The quote's answers as an address query ("category=private&…"), empty values left out. */
export function quoteQuery(details: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const key of quoteKeys) {
    const value = details[key];
    if (value) params.set(key, value);
  }
  return params.toString();
}

/** Read a page's search params into plain strings (first value wins). */
export function fromSearchParams(search: Record<string, string | string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of quoteKeys) {
    const value = search[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") out[key] = first;
  }
  return out;
}

export const quoteFormHref = (details: Record<string, string | undefined> = {}) => {
  const query = quoteQuery(details);
  return query ? `/quote/motor?${query}` : "/quote/motor";
};

export const quoteResultsHref = (details: Record<string, string | undefined>) => `/quote/motor/results?${quoteQuery(details)}`;

/** Key for a set of add-ons, in a fixed order ("excess_protector,pvt"). */
export function addonKey(addons: readonly string[]): string {
  return motorAddons.filter((addon) => addons.includes(addon)).join(",");
}
