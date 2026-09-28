import type { DocumentType, Product } from "./types";

/**
 * Product configuration. Adding health/travel later means adding an entry
 * here plus its copy — not new screens (PROMPTS.md "Add a new product").
 * Labels live in lib/copy; this file holds structure only.
 */

/** Client flow steps, in order. Application.step = index of last completed step (1-based). */
export const motorSteps = ["phone", "vehicle", "logbook", "details", "review"] as const;
export type MotorStep = (typeof motorSteps)[number];

export const motorDocuments: readonly { type: DocumentType; required: boolean }[] = [
  { type: "logbook", required: true },
  { type: "national_id", required: true },
  { type: "kra_pin", required: true },
  { type: "driving_licence", required: false },
];

/** Detail field ids collected for motor. Keys of Application.details. */
export const motorFields = [
  "plate",
  "make",
  "model",
  "year",
  "chassisNumber",
  "bodyType",
  "ownerName",
  "coverType",
  "usage",
  "vehicleValueKes",
] as const;
export type MotorField = (typeof motorFields)[number];

export const coverTypes = ["comprehensive", "third_party_fire_theft", "third_party"] as const;
export type CoverType = (typeof coverTypes)[number];

export const productConfig: Record<Product, { steps: readonly string[] }> = {
  motor: { steps: motorSteps },
};
