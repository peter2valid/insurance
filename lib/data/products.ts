import type { DocumentType, Product } from "./types";

/**
 * Product structure: which documents each product needs and which cover
 * types quotes can have. Labels live in lib/copy; questions live in
 * lib/flow/questions.ts. Adding a product = an entry here, its questions,
 * and its copy (PROMPTS.md "Add a new product").
 */

type DocumentRequirement = { type: DocumentType; required: boolean };

export const productDocuments: Record<Product, readonly DocumentRequirement[]> = {
  // What the broker asks for: logbook, national ID and KRA PIN — nothing else.
  motor: [
    { type: "logbook", required: true },
    { type: "national_id", required: true },
    { type: "kra_pin", required: true },
  ],
  health: [
    { type: "national_id", required: true },
    { type: "dependants_ids", required: false },
  ],
  travel: [{ type: "passport", required: true }],
  business: [
    { type: "business_registration", required: true },
    { type: "kra_pin", required: true },
    { type: "national_id", required: true },
  ],
};

/** @deprecated kept for older imports; use productDocuments.motor */
export const motorDocuments = productDocuments.motor;

/** Cover types a quote can be for, per product. Labels in lib/copy/products. */
export const coverTypesByProduct = {
  motor: ["comprehensive", "third_party_fire_theft", "third_party"],
  health: ["inpatient", "inpatient_outpatient", "full"],
  travel: ["standard", "plus"],
  business: ["package", "liability"],
} as const satisfies Record<Product, readonly string[]>;

/** Motor cover types (the client picks one in the flow). */
export const coverTypes = coverTypesByProduct.motor;
export type CoverType = (typeof coverTypes)[number];

export const allCoverTypes: readonly string[] = Object.values(coverTypesByProduct).flat();
