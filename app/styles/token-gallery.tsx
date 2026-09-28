import { Card } from "@/components/ui/card";
import { styles as copy } from "@/lib/copy";
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingScale,
  typeScale,
} from "@/lib/tokens";
import { Section } from "./showcase";

/*
 * Tailwind only generates classes it can see as full strings, so the
 * swatch and size classes are spelled out rather than built from names.
 */
const swatchClass: Record<(typeof colorTokens)[number]["name"], string> = {
  bg: "bg-bg",
  surface: "bg-surface",
  "surface-alt": "bg-surface-alt",
  ink: "bg-ink",
  "ink-quiet": "bg-ink-quiet",
  brand: "bg-brand",
  "brand-dark": "bg-brand-dark",
  "on-brand": "bg-on-brand",
  accent: "bg-accent",
  border: "bg-border",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
};

const spacingClass: Record<(typeof spacingScale)[number]["step"], string> = {
  1: "w-1",
  2: "w-2",
  3: "w-3",
  4: "w-4",
  6: "w-6",
  8: "w-8",
  12: "w-12",
  16: "w-16",
};

export function TokenGallery() {
  return (
    <>
      <Section id="colour" title={copy.sections.colour}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li key={token.name}>
              <Card className="flex-row items-center gap-3 p-3 sm:p-3">
                <span
                  className={`size-12 shrink-0 rounded-control border border-border ${swatchClass[token.name]}`}
                  aria-hidden
                />
                <span className="flex flex-col">
                  <code className="text-sm font-medium">{token.name}</code>
                  <span className="text-sm text-ink-quiet">{token.purpose}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="fonts" title={copy.sections.fonts}>
        <p className="font-heading text-2xl font-semibold">{copy.fonts.heading}</p>
        <p className="text-lg">{copy.fonts.body}</p>
      </Section>

      <Section id="type" title={copy.sections.type}>
        <ul className="flex flex-col gap-3">
          {typeScale.map((size) => (
            <li key={size.className} className="flex items-baseline gap-4">
              <code className="w-24 shrink-0 text-xs text-ink-quiet">
                {size.className} · {size.px}
              </code>
              <span className={size.className}>{copy.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="spacing" title={copy.sections.spacing}>
        <ul className="flex flex-col gap-2">
          {spacingScale.map((space) => (
            <li key={space.step} className="flex items-center gap-4">
              <code className="w-24 shrink-0 text-xs text-ink-quiet">
                {space.step} · {space.px}px
              </code>
              <span className={`h-4 bg-brand ${spacingClass[space.step]}`} />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="radius" title={copy.sections.radius}>
        <ul className="flex flex-wrap gap-6">
          {radiusTokens.map((radius) => (
            <li key={radius.className} className="flex flex-col items-start gap-2">
              <span className={`size-16 border border-border bg-surface-alt ${radius.className}`} />
              <code className="text-xs text-ink-quiet">
                {radius.className} · {radius.px}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="shadow" title={copy.sections.shadow}>
        <ul className="flex flex-wrap gap-6">
          {shadowTokens.map((shadow) => (
            <li key={shadow} className="flex flex-col items-start gap-2">
              <span className={`size-24 rounded-card bg-surface ${shadow}`} />
              <code className="text-xs text-ink-quiet">{shadow}</code>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
