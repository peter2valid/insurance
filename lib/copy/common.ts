import { brand } from "@/lib/brand";

/** Strings shared across the site, flow, status page and admin. */
export const common = {
  meta: {
    title: brand.name,
    description: `${brand.name} — insurance you can apply for from your phone.`,
  },
  skipToContent: "Skip to main content",
} as const;
