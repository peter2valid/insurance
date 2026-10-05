import Link from "next/link";
import { ArrowRight, Briefcase, Car, Check, HeartPulse, type LucideIcon, Plane, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { productBlurbs, productCta, productNames, site } from "@/lib/copy";
import { products, type Product } from "@/lib/data/types";

const copy = site.hero;

const productIcons: Record<Product, LucideIcon> = {
  motor: Car,
  health: HeartPulse,
  travel: Plane,
  business: Briefcase,
};

/**
 * The hero IS step one of the application (CLAUDE.md §1, §8.1): picking a
 * product goes straight into its flow. This is the one place the design is
 * allowed to be bold (§4.2).
 */
export function Hero({ referredBy }: { referredBy?: string }) {
  return (
    <section aria-labelledby="hero-heading" className="bg-brand text-on-brand">
      <div className="mx-auto grid w-full max-w-page gap-8 px-4 pt-8 pb-12 md:pt-16 md:pb-16 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="flex flex-col gap-4">
          <h1 id="hero-heading" className="text-3xl text-on-brand">
            {copy.heading}
          </h1>
          <p className="max-w-prose text-lg text-on-brand">{copy.body}</p>
          {referredBy && (
            <p className="flex items-center gap-2 self-start rounded-full bg-on-brand/15 px-3 py-1 text-sm text-on-brand">
              <UserRound className="size-4" aria-hidden />
              {copy.referred(referredBy)}
            </p>
          )}

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
    <div className="flex flex-col gap-3 rounded-card bg-surface p-4 text-ink shadow-overlay sm:p-6">
      <h2 className="text-xl">{copy.question}</h2>
      <ul className="flex flex-col gap-3">
        {products.map((product) => {
          const Icon = productIcons[product];
          return (
            <li key={product}>
              <Card asChild interactive className="group flex-row items-center gap-4 p-4 sm:p-4">
                <Link href={`/start/phone?product=${product}`} aria-label={productCta[product]}>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-heading text-lg font-semibold text-ink">{productNames[product]}</span>
                    <span className="text-sm text-ink-quiet">{productBlurbs[product]}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
