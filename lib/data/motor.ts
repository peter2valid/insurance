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
