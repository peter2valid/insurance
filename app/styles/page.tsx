import type { Metadata } from "next";
import Link from "next/link";
import { styles as copy } from "@/lib/copy";
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingScale,
  typeScale,
} from "@/lib/tokens";

export const metadata: Metadata = { title: copy.meta.title };

/*
 * Kitchen-sink page. Stage 1 shows tokens only; Stage 2 adds every kit
 * component in every state.
 *
 * Tailwind only generates classes it can see as full strings, so the
 * swatch/size classes below are spelled out rather than built from names.
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

export default function StylesPage() {
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 py-12">
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex min-h-touch items-center self-start text-sm text-brand underline underline-offset-4 hover:text-brand-dark"
        >
          {copy.back}
        </Link>
        <h1 className="text-3xl">{copy.heading}</h1>
        <p className="max-w-prose text-ink-quiet">{copy.intro}</p>
      </header>

      <Section title={copy.sections.colour}>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-3"
            >
              <span
                className={`size-12 shrink-0 rounded-control border border-border ${swatchClass[token.name]}`}
                aria-hidden
              />
              <span className="flex flex-col">
                <code className="text-sm font-medium">{token.name}</code>
                <span className="text-sm text-ink-quiet">{token.purpose}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.sections.fonts}>
        <p className="font-heading text-2xl font-semibold">{copy.fonts.heading}</p>
        <p className="text-lg">{copy.fonts.body}</p>
      </Section>

      <Section title={copy.sections.type}>
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

      <Section title={copy.sections.spacing}>
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

      <Section title={copy.sections.radius}>
        <ul className="flex flex-wrap gap-6">
          {radiusTokens.map((radius) => (
            <li key={radius.className} className="flex flex-col items-start gap-2">
              <span
                className={`size-16 border border-border bg-surface-alt ${radius.className}`}
              />
              <code className="text-xs text-ink-quiet">
                {radius.className} · {radius.px}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={copy.sections.shadow}>
        <ul className="flex flex-wrap gap-6">
          {shadowTokens.map((shadow) => (
            <li key={shadow} className="flex flex-col items-start gap-2">
              <span className={`size-24 rounded-card bg-surface ${shadow}`} />
              <code className="text-xs text-ink-quiet">{shadow}</code>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
