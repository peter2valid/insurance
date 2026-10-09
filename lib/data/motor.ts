/**
 * Motor insurance structure for Kenya, the way an agent asks it: how the
 * vehicle is used decides the insurance class, which covers exist, what
 * else must be known to price it, and which extras make sense.
 * Words live in lib/copy (products.ts, quote.ts).
 *
 * - private: personal and family cars.
 * - car_hire: self-drive hire cars.
 * - psv_taxi: Uber, Bolt, Little and ordinary taxis.
 * - psv_matatu: matatus, minibuses and buses with fare-paying passengers (per seat).
 * - institutional: school, church and staff buses — passengers, not for fares.
 * - commercial: pick-ups, vans and lorries carrying the owner's own goods (by tonnage).
 * - general_cartage: transporters carrying other people's goods for pay (by tonnage).
 * - motorcycle: boda boda — passengers or parcels for pay.
 * - motorcycle_private: a personal motorbike or a business's delivery bike.
 * - tuktuk: three-wheelers carrying passengers.
 */

export const vehicleCategories = [
  "private",
  "psv_taxi",
  "car_hire",
  "psv_matatu",
  "institutional",
  "commercial",
  "general_cartage",
  "motorcycle",
  "motorcycle_private",
  "tuktuk",
] as const;
export type VehicleCategory = (typeof vehicleCategories)[number];

export function isVehicleCategory(value: unknown): value is VehicleCategory {
  return typeof value === "string" && (vehicleCategories as readonly string[]).includes(value);
}

/** Public service vehicles carry paying passengers. */
export function isPsv(category: string | undefined): boolean {
  return category === "psv_matatu" || category === "psv_taxi" || category === "motorcycle" || category === "tuktuk";
}

/** Two and three wheelers: no courtesy car or road rescue. */
export function isSmallVehicle(category: string | undefined): boolean {
  return category === "motorcycle" || category === "motorcycle_private" || category === "tuktuk";
}

/** Earns money with the vehicle: a breakdown means lost income, not a lost lift. */
export function earnsIncome(category: string | undefined): boolean {
  return isPsv(category) || category === "car_hire" || category === "commercial" || category === "general_cartage";
}

export const motorCoverTypes = ["comprehensive", "third_party_fire_theft", "third_party"] as const;
export type MotorCoverType = (typeof motorCoverTypes)[number];

/** Third party, fire and theft isn't sold for fare-paying passenger vehicles. */
export function coversFor(category: string | undefined): readonly MotorCoverType[] {
  if (isPsv(category) || category === "car_hire") return ["comprehensive", "third_party"];
  return motorCoverTypes;
}

/** Matatus, taxis, boda bodas and tuk-tuks can buy a month at a time. */
export function offersMonthly(category: string | undefined): boolean {
  return isPsv(category);
}

export type CoverPeriod = "annual" | "monthly";

export function periodOf(details: Record<string, string>): CoverPeriod {
  return details.period === "monthly" && offersMonthly(details.category) ? "monthly" : "annual";
}

/** Seats matter for buses: passenger liability is priced per seat. */
export function needsSeats(category: string | undefined): boolean {
  return category === "psv_matatu" || category === "institutional";
}

/** Goods vehicles are priced by how much they carry. */
export const tonnageBands = ["up_to_3", "3_to_8", "8_to_20", "over_20"] as const;
export type TonnageBand = (typeof tonnageBands)[number];

export function needsTonnage(category: string | undefined): boolean {
  return category === "commercial" || category === "general_cartage";
}

export function isTonnageBand(value: unknown): value is TonnageBand {
  return typeof value === "string" && (tonnageBands as readonly string[]).includes(value);
}

/** Matatu up to 14 seats, minibus up to 33, bus beyond. */
export function busSize(seats: string | undefined): "matatu" | "minibus" | "bus" {
  const n = Number(seats);
  return n > 33 ? "bus" : n > 14 ? "minibus" : "matatu";
}

/**
 * Optional extras. Excess protector and political violence only add to
 * comprehensive cover; loss of use too; road rescue goes with any cover on
 * four wheels. Words in lib/copy/quote.ts.
 */
export const motorAddons = ["excess_protector", "pvt", "loss_of_use", "road_rescue"] as const;
export type MotorAddon = (typeof motorAddons)[number];

export function isMotorAddon(value: unknown): value is MotorAddon {
  return typeof value === "string" && (motorAddons as readonly string[]).includes(value);
}

export function addonsFor(category: string | undefined, coverType: string | undefined): MotorAddon[] {
  const comprehensive = coverType === "comprehensive";
  const fourWheels = !isSmallVehicle(category);
  return motorAddons.filter((addon) => {
    if (addon === "road_rescue") return fourWheels;
    if (addon === "loss_of_use") return comprehensive && fourWheels;
    return comprehensive;
  });
}

/** The add-ons saved on an application ("excess_protector,pvt") that still apply. */
export function addonsOf(details: Record<string, string>): MotorAddon[] {
  const offered = addonsFor(details.category, details.coverType);
  return (details.addons ?? "").split(",").filter((addon): addon is MotorAddon => offered.includes(addon as MotorAddon));
}

/** Common makes on Kenyan roads, by kind of vehicle. */
const carMakes = [
  "Toyota", "Nissan", "Mazda", "Subaru", "Mitsubishi", "Honda", "Isuzu", "Volkswagen", "Mercedes-Benz",
  "BMW", "Suzuki", "Hyundai", "Ford", "Land Rover", "Audi", "Peugeot", "Kia", "Volvo", "Lexus",
];
const busMakes = ["Toyota", "Nissan", "Isuzu", "Mitsubishi Fuso", "Hino", "Scania", "Mercedes-Benz", "Yutong", "Golden Dragon"];
const truckMakes = ["Isuzu", "Mitsubishi Fuso", "Hino", "Toyota", "Nissan", "Mercedes-Benz", "Scania", "Volvo", "MAN", "Tata", "Ashok Leyland", "FAW", "Sinotruk"];
const bikeMakes = ["Bajaj", "TVS", "Honda", "Haojue", "Yamaha", "Suzuki", "Kingbird", "Skygo"];
const tuktukMakes = ["Bajaj", "TVS", "Piaggio"];

export function makesFor(category: string | undefined): string[] {
  const list =
    category === "motorcycle" || category === "motorcycle_private"
      ? bikeMakes
      : category === "tuktuk"
        ? tuktukMakes
        : needsTonnage(category)
          ? truckMakes
          : needsSeats(category)
            ? busMakes
            : carMakes;
  return [...list].sort((a, b) => a.localeCompare(b));
}

export const OLDEST_YEAR = 1990;

/** Age in years from the year of manufacture (0 for this year's model). */
export function vehicleAge(year: string | undefined, now: Date = new Date()): number | undefined {
  const n = Number(year);
  return Number.isInteger(n) && n > 1900 ? Math.max(0, now.getFullYear() - n) : undefined;
}
