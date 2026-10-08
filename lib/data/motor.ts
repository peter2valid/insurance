/**
 * Motor insurance structure for Kenya: how a vehicle is used decides which
 * covers exist and how it's priced. Words live in lib/copy/motor.ts.
 *
 * - Private: personal cars.
 * - Commercial: pick-ups, vans and lorries carrying the owner's goods.
 * - PSV matatu / bus: carries fare-paying passengers (priced per seat).
 * - Taxi / ride-hailing: Uber, Bolt, Little and ordinary taxis.
 * - Boda boda: motorcycles carrying passengers or goods.
 * - Tuk-tuk: three-wheelers.
 */

export const vehicleCategories = ["private", "commercial", "psv_matatu", "psv_taxi", "motorcycle", "tuktuk"] as const;
export type VehicleCategory = (typeof vehicleCategories)[number];

export function isVehicleCategory(value: unknown): value is VehicleCategory {
  return typeof value === "string" && (vehicleCategories as readonly string[]).includes(value);
}

/** Public service vehicles carry paying passengers. */
export function isPsv(category: string | undefined): boolean {
  return category === "psv_matatu" || category === "psv_taxi" || category === "motorcycle" || category === "tuktuk";
}

export const motorCoverTypes = ["comprehensive", "third_party_fire_theft", "third_party"] as const;
export type MotorCoverType = (typeof motorCoverTypes)[number];

/** Third party, fire and theft is usually only sold for private and commercial vehicles. */
export function coversFor(category: string | undefined): readonly MotorCoverType[] {
  if (category === "private" || category === "commercial" || !category) return motorCoverTypes;
  return ["comprehensive", "third_party"];
}

/** Matatus, taxis, boda bodas and tuk-tuks can buy a month at a time. */
export function offersMonthly(category: string | undefined): boolean {
  return isPsv(category);
}

export type CoverPeriod = "annual" | "monthly";

export function periodOf(details: Record<string, string>): CoverPeriod {
  return details.period === "monthly" && offersMonthly(details.category) ? "monthly" : "annual";
}

/** Seats matter for matatus and buses (passenger liability is per seat). */
export function needsSeats(category: string | undefined): boolean {
  return category === "psv_matatu";
}

/** Optional extras on comprehensive cover. Words in lib/copy/quote.ts. */
export const motorAddons = ["excess_protector", "pvt"] as const;
export type MotorAddon = (typeof motorAddons)[number];

export function isMotorAddon(value: unknown): value is MotorAddon {
  return typeof value === "string" && (motorAddons as readonly string[]).includes(value);
}

/** The add-ons saved on an application ("excess_protector,pvt"). */
export function addonsOf(details: Record<string, string>): MotorAddon[] {
  if (details.coverType !== "comprehensive") return [];
  return (details.addons ?? "").split(",").filter(isMotorAddon);
}

/** Common makes on Kenyan roads, by kind of vehicle. "other" is always last. */
const carMakes = [
  "Toyota", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Honda", "Isuzu", "Volkswagen", "Mercedes-Benz",
  "BMW", "Suzuki", "Hyundai", "Ford", "Land Rover", "Audi", "Peugeot", "Kia", "Volvo", "Mitsubishi Fuso", "Hino",
];
const bikeMakes = ["Bajaj", "TVS", "Honda", "Haojue", "Yamaha", "Suzuki", "Kingbird", "Skygo"];
const tuktukMakes = ["Bajaj", "TVS", "Piaggio"];

export function makesFor(category: string | undefined): string[] {
  const list = category === "motorcycle" ? bikeMakes : category === "tuktuk" ? tuktukMakes : carMakes;
  return [...list].sort((a, b) => a.localeCompare(b));
}

export const OLDEST_YEAR = 1990;

/** Age in years from the year of manufacture (0 for this year's model). */
export function vehicleAge(year: string | undefined, now: Date = new Date()): number | undefined {
  const n = Number(year);
  return Number.isInteger(n) && n > 1900 ? Math.max(0, now.getFullYear() - n) : undefined;
}
