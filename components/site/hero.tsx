import Link from "next/link";
import { ArrowRight, Briefcase, Car, Check, HeartPulse, type LucideIcon, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { site } from "@/lib/copy";

const copy = site.hero;

const otherIcons: Record<(typeof copy.others)[number]["id"], LucideIcon> = {
  health: HeartPulse,
  travel: Plane,
  business: Briefcase,
};

/**
 * The hero IS step one of the application (CLAUDE.md §1, §8.1): picking
 * Motor goes straight into the flow. This is the one place the design is
 * allowed to be bold (§4.2).
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="bg-brand text-on-brand">
      <div className="mx-auto grid w-full max-w-page gap-8 px-4 pt-8 pb-12 md:pt-16 md:pb-16 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="flex flex-col gap-4">
          <h1 id="hero-heading" className="text-3xl text-on-brand">
            {copy.heading}
          </h1>
          <p className="max-w-prose text-lg text-on-brand">{copy.body}</p>

          <div className="hidden flex-col gap-2 pt-4 lg:flex">
            <p className="text-base font-semibold text-on-brand">{copy.needsHeading}</p>
            <NeedsList />
          </div>
        </div>

        <ProductPicker />

        <div className="flex flex-col gap-2 lg:hidden">
          <p className="text-base font-semibold text-on-brand">{copy.needsHeading}</p>
          <NeedsList />
        </div>
      </div>
    </section>
  );
}

function NeedsList() {
  return (
    <>
      <ul className="flex flex-col gap-2">
        {copy.needs.map((item) => (
          <li key={item} className="flex items-start gap-2 text-base text-on-brand">
            <span className="flex h-6 shrink-0 items-center">
              <Check className="size-5" aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p className="text-sm text-on-brand">{copy.duration}</p>
    </>
  );
}

function ProductPicker() {
  return (
    <div className="flex flex-col gap-4 rounded-card bg-surface p-4 text-ink shadow-overlay sm:p-6">
      <h2 className="text-xl">{copy.question}</h2>

      <Card
        asChild
        interactive
        className="group flex-row items-center gap-4 border-2 border-brand p-4 sm:p-4"
      >
        <Link href="/start/phone">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
            <Car className="size-6" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="font-heading text-lg font-semibold text-ink">{copy.motor.title}</span>
            <span className="text-sm text-ink-quiet">{copy.motor.body}</span>
            <span className="inline-flex items-center gap-1 pt-1 text-base font-medium text-brand group-hover:underline">
              {copy.motor.action}
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </span>
        </Link>
      </Card>

      <div className="flex flex-col gap-2">
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border">
          {copy.others.map((product) => {
            const Icon = otherIcons[product.id];
            return (
              <li
                key={product.id}
                className="flex min-h-touch items-center gap-3 px-4 py-2 text-ink-quiet"
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1 text-base">{product.title}</span>
                <StatusBadge tone="neutral" label={copy.comingNext} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
