import { brand } from "@/lib/brand";

/**
 * Marketing site strings.
 * Stage 1 holds only the foundation placeholder; the hero arrives in Stage 5.
 */
export const site = {
  foundation: {
    heading: brand.name,
    body: "The foundation is in place. The hero and application flow come in later stages.",
    stylesLink: "See design tokens",
  },
} as const;
