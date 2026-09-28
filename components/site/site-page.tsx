import * as React from "react";
import { cn } from "@/lib/utils";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/**
 * SitePage template: header, main content, footer. Used by app/(site)/layout.
 * Pages fill it with SiteSection blocks.
 */
export function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

type SiteSectionProps = {
  id?: string;
  title?: string;
  intro?: string;
  /** "alt" gives a subtle panel background to separate sections. */
  tone?: "default" | "alt";
  children?: React.ReactNode;
  className?: string;
};

/** One band of the marketing page, with consistent width and rhythm. */
export function SiteSection({ id, title, intro, tone = "default", children, className }: SiteSectionProps) {
  const headingId = id && title ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-16", tone === "alt" && "bg-surface-alt", className)}
    >
      <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 py-12 md:py-16">
        {(title || intro) && (
          <div className="flex flex-col gap-2">
            {title && (
              <h2 id={headingId} className="text-2xl">
                {title}
              </h2>
            )}
            {intro && <p className="max-w-prose text-lg text-ink-quiet">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
