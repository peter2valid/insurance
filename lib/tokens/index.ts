/**
 * Token names, for TypeScript and the /styles page.
 * Values live in ./tokens.css — this file never repeats them.
 */

export const colorTokens = [
  { name: "bg", purpose: "Page background" },
  { name: "surface", purpose: "Cards, inputs" },
  { name: "surface-alt", purpose: "Subtle panels" },
  { name: "ink", purpose: "Main text" },
  { name: "ink-quiet", purpose: "Secondary text" },
  { name: "brand", purpose: "Primary actions, key UI" },
  { name: "brand-dark", purpose: "Hover and pressed" },
  { name: "on-brand", purpose: "Text on brand and status fills" },
  { name: "accent", purpose: "Highlights, “new” markers — never text" },
  { name: "border", purpose: "Dividers, outlines" },
  { name: "success", purpose: "Confirmed, done" },
  { name: "warn", purpose: "Needs attention" },
  { name: "danger", purpose: "Errors" },
] as const;

export type ColorToken = (typeof colorTokens)[number]["name"];

/** Tailwind class → size in px, matching the 12/14/16/18/22/28/36 scale. */
export const typeScale = [
  { className: "text-xs", px: 12 },
  { className: "text-sm", px: 14 },
  { className: "text-base", px: 16 },
  { className: "text-lg", px: 18 },
  { className: "text-xl", px: 22 },
  { className: "text-2xl", px: 28 },
  { className: "text-3xl", px: 36 },
] as const;

/** Allowed spacing steps: Tailwind step → px. */
export const spacingScale = [
  { step: 1, px: 4 },
  { step: 2, px: 8 },
  { step: 3, px: 12 },
  { step: 4, px: 16 },
  { step: 6, px: 24 },
  { step: 8, px: 32 },
  { step: 12, px: 48 },
  { step: 16, px: 64 },
] as const;

export const radiusTokens = [
  { className: "rounded-control", px: "8" },
  { className: "rounded-card", px: "14" },
  { className: "rounded-full", px: "full" },
] as const;

export const shadowTokens = ["shadow-raised", "shadow-overlay"] as const;
