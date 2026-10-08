import type { MotorAddon, VehicleCategory } from "./motor";

/**
 * The broker's insurer panel and their motor rate cards.
 *
 * Names: the insurers the broker said he places business with (Oct 2026).
 * Confirm the final list with him before launch.
 *
 * Rates: SAMPLE figures shaped like the Kenyan market. They are NOT any
 * insurer's real rates — replace each card with the insurer's actual rate
 * card (or an API) before quoting real clients. Everything that prices a
 * quote reads from here, so that's a data change, not a code change.
 */

export type MotorRates = {
  /** Comprehensive: percent of the vehicle's value, with a minimum premium. */
  comprehensive: { rate: number; minimum: number };
  /** Third party, fire and theft: percent of value, with a minimum. */
  tpft: { rate: number; minimum: number };
  /** Third party only: flat yearly premium, plus a per-seat charge for matatus. */
  thirdParty: { base: number; perSeat?: number };
};

/** An optional extra: percent of the vehicle's value with a minimum, or already in the cover. */
export type AddonRate = { rate: number; minimum: number } | { included: true };

export type Insurer = {
  id: string;
  name: string;
  /** Sample rate card per vehicle category. */
  motor: Record<VehicleCategory, MotorRates>;
  /** Comprehensive excess: percent of value, with a minimum (sample). */
  excess: { rate: number; minimum: number };
  /** What this insurer's motor cover includes, by cover type (sample wording). */
  benefits: { comprehensive: string[]; third_party_fire_theft: string[]; third_party: string[] };
  /** Comprehensive add-ons (sample prices). */
  addons: Record<MotorAddon, AddonRate>;
  /** Oldest vehicle (years) this insurer covers comprehensively (sample). */
  maxAgeComprehensive: number;
  /** Applied to health, travel and business fixture prices (sample). */
  otherFactor: number;
};

/** A typical market card; each insurer below is a little cheaper or dearer. */
const base: Record<VehicleCategory, MotorRates> = {
  private: { comprehensive: { rate: 4, minimum: 25_000 }, tpft: { rate: 2.5, minimum: 15_000 }, thirdParty: { base: 7_500 } },
  commercial: { comprehensive: { rate: 4.5, minimum: 30_000 }, tpft: { rate: 3, minimum: 20_000 }, thirdParty: { base: 10_000 } },
  psv_matatu: { comprehensive: { rate: 6.5, minimum: 60_000 }, tpft: { rate: 5, minimum: 45_000 }, thirdParty: { base: 15_000, perSeat: 2_000 } },
  psv_taxi: { comprehensive: { rate: 5.5, minimum: 40_000 }, tpft: { rate: 4, minimum: 30_000 }, thirdParty: { base: 15_000 } },
  motorcycle: { comprehensive: { rate: 6, minimum: 10_000 }, tpft: { rate: 4, minimum: 7_500 }, thirdParty: { base: 4_500 } },
  tuktuk: { comprehensive: { rate: 6, minimum: 15_000 }, tpft: { rate: 4, minimum: 10_000 }, thirdParty: { base: 8_000 } },
};

function scaled(factor: number, overrides: Partial<Record<VehicleCategory, number>> = {}): Record<VehicleCategory, MotorRates> {
  const out = {} as Record<VehicleCategory, MotorRates>;
  for (const [category, card] of Object.entries(base) as [VehicleCategory, MotorRates][]) {
    const f = overrides[category] ?? factor;
    out[category] = {
      comprehensive: { rate: round2(card.comprehensive.rate * f), minimum: round100(card.comprehensive.minimum * f) },
      tpft: { rate: round2(card.tpft.rate * f), minimum: round100(card.tpft.minimum * f) },
      thirdParty: {
        base: round100(card.thirdParty.base * f),
        ...(card.thirdParty.perSeat && { perSeat: round100(card.thirdParty.perSeat * f) }),
      },
    };
  }
  return out;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round100 = (n: number) => Math.round(n / 100) * 100;

export const insurers: readonly Insurer[] = [
  {
    id: "britam",
    name: "Britam",
    motor: scaled(1),
    excess: { rate: 2.5, minimum: 15_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 50,000", "Towing up to KES 30,000", "Courtesy car for 10 days", "24-hour rescue line"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { excess_protector: { rate: 0.25, minimum: 3_000 }, pvt: { rate: 0.25, minimum: 2_500 } },
    maxAgeComprehensive: 15,
    otherFactor: 1,
  },
  {
    id: "pioneer",
    name: "Pioneer",
    motor: scaled(0.96, { psv_matatu: 0.93, motorcycle: 0.9 }),
    excess: { rate: 2.5, minimum: 20_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 40,000", "Towing up to KES 25,000", "Political violence and terrorism"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { excess_protector: { rate: 0.25, minimum: 2_500 }, pvt: { included: true } },
    maxAgeComprehensive: 12,
    otherFactor: 0.96,
  },
  {
    id: "liberty",
    name: "Liberty",
    motor: scaled(1.04, { psv_taxi: 0.97 }),
    excess: { rate: 2, minimum: 15_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 60,000", "Excess protector included", "Radio and entertainment system", "Towing up to KES 30,000"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property", "Towing after theft recovery"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { excess_protector: { included: true }, pvt: { rate: 0.3, minimum: 3_000 } },
    maxAgeComprehensive: 15,
    otherFactor: 1.05,
  },
  {
    id: "cannon",
    name: "Cannon",
    motor: scaled(0.93, { private: 0.95 }),
    excess: { rate: 3, minimum: 10_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 30,000", "Towing up to KES 20,000"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { excess_protector: { rate: 0.3, minimum: 3_000 }, pvt: { rate: 0.25, minimum: 2_000 } },
    maxAgeComprehensive: 20,
    otherFactor: 0.93,
  },
];

export function insurerByName(name: string): Insurer | undefined {
  return insurers.find((insurer) => insurer.name === name);
}

/**
 * Statutory charges added to every Kenyan general insurance premium:
 * training levy 0.2%, Policyholders' Compensation Fund 0.25%, stamp duty KES 40.
 * Check the current figures with the insurer before launch.
 */
export const LEVIES = { trainingLevy: 0.002, phcf: 0.0025, stampDuty: 40 } as const;

/** Monthly PSV covers cost a little more than a twelfth of the year (sample). */
export const MONTHLY_FACTOR = 0.12;
