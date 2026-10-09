import type { MotorAddon, TonnageBand, VehicleCategory } from "./motor";

/**
 * Every Kenyan insurer that writes motor cover, and their motor rate cards.
 *
 * Names: general insurers on the Insurance Regulatory Authority's 2026
 * licensed list that write motor business (health-only insurers left out).
 * Only the insurers on the broker's PANEL are quoted to clients — the broker
 * switches them on in Admin → Insurers. Default panel: the four the broker
 * named (Oct 2026). Switch an insurer on only once the agency is appointed
 * by it: showing it to clients says the agency places business there.
 *
 * Rates, accepted classes, age limits, tracker limits and extras: SAMPLE
 * figures shaped like the Kenyan market (a few levels follow published
 * figures, e.g. excess protector 0.25%, min KES 3,000). They are NOT any
 * insurer's real terms — replace each card with the insurer's actual rate
 * card (or an API) before quoting real clients. Everything that prices a
 * quote reads from here, so that's a data change, not a code change.
 *
 * Logos: drop the insurer's official logo at public/insurers/<id>.svg (or
 * .png) and set `logo`. Use logos only with the insurer's permission
 * (agencies usually get them in the insurer's marketing kit). Until then
 * the UI shows the insurer's initials.
 */

export type MotorRates = {
  /** Comprehensive: percent of the vehicle's value, with a minimum premium. */
  comprehensive: { rate: number; minimum: number };
  /** Third party, fire and theft: percent of value, with a minimum. */
  tpft: { rate: number; minimum: number };
  /** Third party only: flat yearly premium, plus a per-seat charge for buses. */
  thirdParty: { base: number; perSeat?: number; byTonnage?: Record<TonnageBand, number> };
};

/** An optional extra: percent of the vehicle's value with a minimum, a flat price, or already in the cover. */
export type AddonRate = { rate: number; minimum: number } | { flat: number } | { included: true };

export type Insurer = {
  id: string;
  /** Short name clients know ("ICEA LION"). Stored on quotes, so keep it stable. */
  name: string;
  /** Registered name, as on the IRA list. */
  legalName: string;
  /** Path under /public, e.g. "/insurers/britam.svg". Empty until the broker supplies it. */
  logo?: string;
  /** Classes this insurer accepts (sample). */
  accepts: readonly VehicleCategory[];
  /** Sample rate card per vehicle category. */
  motor: Record<VehicleCategory, MotorRates>;
  /** Comprehensive excess: percent of value, with a minimum (sample). */
  excess: { rate: number; minimum: number };
  /** What this insurer's motor cover includes, by cover type (sample wording). */
  benefits: { comprehensive: string[]; third_party_fire_theft: string[]; third_party: string[] };
  /** Optional extras (sample prices). */
  addons: Record<MotorAddon, AddonRate>;
  /** Oldest vehicle (years) this insurer covers comprehensively (sample). */
  maxAgeComprehensive: number;
  /** Comprehensive above this value needs an approved tracking device (sample). */
  trackerAbove: number;
  /** Something the broker should know before switching it on (admin only). */
  caution?: "status";
  /** Applied to health, travel and business fixture prices (sample). */
  otherFactor: number;
};

const tonnage = (a: number, b: number, c: number, d: number): Record<TonnageBand, number> => ({
  up_to_3: a,
  "3_to_8": b,
  "8_to_20": c,
  over_20: d,
});

/** A typical market card; each insurer below is a little cheaper or dearer. */
const base: Record<VehicleCategory, MotorRates> = {
  private: { comprehensive: { rate: 4, minimum: 25_000 }, tpft: { rate: 2.5, minimum: 15_000 }, thirdParty: { base: 7_500 } },
  car_hire: { comprehensive: { rate: 6, minimum: 35_000 }, tpft: { rate: 4.5, minimum: 25_000 }, thirdParty: { base: 10_000 } },
  psv_taxi: { comprehensive: { rate: 5.5, minimum: 40_000 }, tpft: { rate: 4, minimum: 30_000 }, thirdParty: { base: 15_000 } },
  psv_matatu: {
    comprehensive: { rate: 6.5, minimum: 60_000 },
    tpft: { rate: 5, minimum: 45_000 },
    // A 14-seater lands near the KES 16,000 a month reported for matatu third party cover (Nation).
    thirdParty: { base: 25_000, perSeat: 7_500 },
  },
  institutional: {
    comprehensive: { rate: 4.5, minimum: 35_000 },
    tpft: { rate: 3.5, minimum: 25_000 },
    thirdParty: { base: 10_000, perSeat: 500 },
  },
  // Third party by tonnage follows the shape of published own-goods / cartage tables.
  commercial: {
    comprehensive: { rate: 4.5, minimum: 30_000 },
    tpft: { rate: 3, minimum: 20_000 },
    thirdParty: { base: 7_500, byTonnage: tonnage(7_500, 12_000, 18_000, 20_000) },
  },
  general_cartage: {
    comprehensive: { rate: 5.5, minimum: 40_000 },
    tpft: { rate: 3.5, minimum: 25_000 },
    thirdParty: { base: 7_500, byTonnage: tonnage(7_500, 15_000, 20_000, 25_000) },
  },
  motorcycle: { comprehensive: { rate: 6, minimum: 10_000 }, tpft: { rate: 4, minimum: 7_500 }, thirdParty: { base: 4_500 } },
  motorcycle_private: { comprehensive: { rate: 4.5, minimum: 7_500 }, tpft: { rate: 3, minimum: 5_000 }, thirdParty: { base: 3_000 } },
  tuktuk: { comprehensive: { rate: 6, minimum: 15_000 }, tpft: { rate: 4, minimum: 10_000 }, thirdParty: { base: 8_000 } },
};

function scaled(factor: number, overrides: Partial<Record<VehicleCategory, number>> = {}): Record<VehicleCategory, MotorRates> {
  const out = {} as Record<VehicleCategory, MotorRates>;
  for (const [category, card] of Object.entries(base) as [VehicleCategory, MotorRates][]) {
    const f = overrides[category] ?? factor;
    const byTonnage = card.thirdParty.byTonnage;
    out[category] = {
      comprehensive: { rate: round2(card.comprehensive.rate * f), minimum: round100(card.comprehensive.minimum * f) },
      tpft: { rate: round2(card.tpft.rate * f), minimum: round100(card.tpft.minimum * f) },
      thirdParty: {
        base: round100(card.thirdParty.base * f),
        ...(card.thirdParty.perSeat && { perSeat: round100(card.thirdParty.perSeat * f) }),
        ...(byTonnage && {
          byTonnage: tonnage(
            round100(byTonnage.up_to_3 * f),
            round100(byTonnage["3_to_8"] * f),
            round100(byTonnage["8_to_20"] * f),
            round100(byTonnage.over_20 * f),
          ),
        }),
      },
    };
  }
  return out;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round100 = (n: number) => Math.round(n / 100) * 100;

const ALL: readonly VehicleCategory[] = [
  "private", "psv_taxi", "car_hire", "psv_matatu", "institutional", "commercial", "general_cartage", "motorcycle", "motorcycle_private", "tuktuk",
];
/** Mainstream insurers that don't take matatus, boda bodas or tuk-tuks (sample). */
const NO_PSV = ALL.filter((c) => c !== "psv_matatu" && c !== "motorcycle" && c !== "tuktuk");

/** Standard wording for insurers without their own sample benefits. */
const standardBenefits = {
  comprehensive: ["Accident, fire and theft", "Windscreen cover", "Towing after an accident", "Third party injury and property"],
  third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
  third_party: ["Third party injury and property", "Passenger legal liability"],
};

const standardAddons: Record<MotorAddon, AddonRate> = {
  excess_protector: { rate: 0.25, minimum: 3_000 },
  pvt: { rate: 0.25, minimum: 2_500 },
  loss_of_use: { flat: 3_000 },
  road_rescue: { flat: 3_500 },
};

type Entry = Pick<Insurer, "id" | "name" | "legalName"> &
  Partial<Omit<Insurer, "id" | "name" | "legalName" | "motor">> & {
    factor: number;
    overrides?: Partial<Record<VehicleCategory, number>>;
  };

function insurer(entry: Entry): Insurer {
  const { factor, overrides, ...rest } = entry;
  return {
    accepts: ALL,
    excess: { rate: 2.5, minimum: 15_000 },
    benefits: standardBenefits,
    addons: standardAddons,
    maxAgeComprehensive: 15,
    trackerAbove: 3_000_000,
    otherFactor: factor,
    ...rest,
    motor: scaled(factor, overrides),
  };
}

export const insurers: readonly Insurer[] = [
  // The broker's panel (Oct 2026) — with their own sample benefits.
  insurer({
    id: "britam",
    name: "Britam",
    legalName: "Britam General Insurance Company (K) Limited",
    factor: 1,
    benefits: {
      comprehensive: ["Windscreen up to KES 50,000", "Towing up to KES 30,000", "Courtesy car for 10 days", "24-hour rescue line"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { ...standardAddons, excess_protector: { rate: 0.25, minimum: 3_000 }, loss_of_use: { included: true } },
  }),
  insurer({
    id: "pioneer",
    name: "Pioneer",
    legalName: "Pioneer General Insurance Limited",
    factor: 0.96,
    overrides: { psv_matatu: 0.93, motorcycle: 0.9 },
    excess: { rate: 2.5, minimum: 20_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 40,000", "Towing up to KES 25,000", "Political violence and terrorism"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { ...standardAddons, excess_protector: { rate: 0.25, minimum: 2_500 }, pvt: { included: true } },
    maxAgeComprehensive: 12,
    trackerAbove: 2_500_000,
  }),
  insurer({
    id: "liberty",
    name: "Liberty",
    legalName: "The Heritage Insurance Company Limited (Liberty Kenya)",
    factor: 1.04,
    overrides: { psv_taxi: 0.97 },
    excess: { rate: 2, minimum: 15_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 60,000", "Excess protector included", "Radio and entertainment system", "Towing up to KES 30,000"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property", "Towing after theft recovery"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { ...standardAddons, excess_protector: { included: true }, pvt: { rate: 0.3, minimum: 3_000 } },
  }),
  insurer({
    id: "cannon",
    name: "Cannon",
    legalName: "Cannon General Insurance Company Limited",
    factor: 0.93,
    overrides: { private: 0.95 },
    excess: { rate: 3, minimum: 10_000 },
    benefits: {
      comprehensive: ["Windscreen up to KES 30,000", "Towing up to KES 20,000"],
      third_party_fire_theft: ["Theft and fire cover", "Third party injury and property"],
      third_party: ["Third party injury and property", "Passenger legal liability"],
    },
    addons: { ...standardAddons, excess_protector: { rate: 0.3, minimum: 3_000 }, pvt: { rate: 0.25, minimum: 2_000 } },
    maxAgeComprehensive: 20,
  }),

  // Others on the IRA 2026 list that write motor — off until the broker switches them on.
  insurer({ id: "apa", name: "APA", legalName: "APA Insurance Limited", factor: 1.02, accepts: NO_PSV }),
  insurer({ id: "amaco", name: "AMACO", legalName: "Africa Merchant Assurance Company Limited", factor: 0.95, overrides: { psv_matatu: 0.9, motorcycle: 0.92 } }),
  insurer({ id: "cic", name: "CIC", legalName: "CIC General Insurance Limited", factor: 0.99, accepts: NO_PSV }),
  insurer({ id: "definite", name: "Definite", legalName: "Definite Assurance Company Limited", factor: 0.94, overrides: { psv_matatu: 0.92 } }),
  insurer({
    id: "directline",
    name: "Directline",
    legalName: "Directline Assurance Company Limited",
    factor: 0.97,
    overrides: { psv_matatu: 0.88 },
    caution: "status",
  }),
  insurer({ id: "equity", name: "Equity General", legalName: "Equity General Insurance (Kenya) Limited", factor: 1.01, accepts: NO_PSV }),
  insurer({ id: "fidelity", name: "Fidelity Shield", legalName: "Fidelity Shield Insurance Company Limited", factor: 0.97 }),
  insurer({ id: "first", name: "First Assurance", legalName: "First Assurance Company Limited", factor: 0.98, overrides: { psv_matatu: 0.94 } }),
  insurer({ id: "ga", name: "GA Insurance", legalName: "GA Insurance Limited", factor: 1.0, overrides: { psv_matatu: 0.95, motorcycle: 0.95 } }),
  insurer({ id: "geminia", name: "Geminia", legalName: "Geminia Insurance Company Limited", factor: 0.98, accepts: NO_PSV }),
  insurer({ id: "icea_lion", name: "ICEA LION", legalName: "ICEA LION General Insurance Company Limited", factor: 1.06, accepts: NO_PSV, maxAgeComprehensive: 12 }),
  insurer({ id: "intra_africa", name: "Intra Africa", legalName: "Intra Africa Assurance Company Limited", factor: 0.96 }),
  insurer({ id: "kenindia", name: "Kenindia", legalName: "Kenindia Assurance Company Limited", factor: 1.0, accepts: NO_PSV }),
  insurer({ id: "kenya_orient", name: "Kenya Orient", legalName: "Kenya Orient Insurance Limited", factor: 0.95 }),
  insurer({ id: "kenyan_alliance", name: "Kenyan Alliance", legalName: "The Kenyan Alliance Insurance Company Limited", factor: 0.99, accepts: NO_PSV }),
  insurer({ id: "madison", name: "Madison", legalName: "Madison General Insurance Kenya Limited", factor: 1.0, accepts: NO_PSV }),
  insurer({ id: "mayfair", name: "Mayfair", legalName: "Mayfair Insurance Company Limited", factor: 0.98, accepts: NO_PSV }),
  insurer({ id: "monarch", name: "Monarch", legalName: "The Monarch Insurance Company Limited", factor: 0.96 }),
  insurer({ id: "mua", name: "MUA", legalName: "MUA Insurance (Kenya) Limited", factor: 1.03, accepts: NO_PSV }),
  insurer({ id: "occidental", name: "Occidental", legalName: "Occidental Insurance Company Limited", factor: 0.97, accepts: NO_PSV }),
  insurer({ id: "old_mutual", name: "Old Mutual", legalName: "Old Mutual General Insurance Kenya Limited", factor: 1.05, accepts: NO_PSV }),
  insurer({ id: "pacis", name: "Pacis", legalName: "Pacis Insurance Company Limited", factor: 0.97, accepts: NO_PSV }),
  insurer({
    id: "sanlam_allianz",
    name: "Sanlam Allianz",
    legalName: "Sanlam Allianz General Insurance (Kenya) Limited",
    factor: 1.04,
    accepts: NO_PSV,
    // Published: own-damage excess 2.5%, min KES 20,000; excess protector 0.25%, min KES 3,000.
    excess: { rate: 2.5, minimum: 20_000 },
  }),
  insurer({ id: "takaful", name: "Takaful", legalName: "Takaful Insurance of Africa Limited", factor: 1.0, accepts: NO_PSV }),
  insurer({ id: "tausi", name: "Tausi", legalName: "Tausi Assurance Company Limited", factor: 0.98, accepts: NO_PSV }),
];

/** The four insurers the broker named (Oct 2026). */
export const DEFAULT_PANEL: readonly string[] = ["britam", "pioneer", "liberty", "cannon"];

/** The insurers switched on, in catalogue order. Unknown ids are ignored. */
export function panelInsurers(panel: readonly string[] = DEFAULT_PANEL): Insurer[] {
  return insurers.filter((insurer) => panel.includes(insurer.id));
}

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
