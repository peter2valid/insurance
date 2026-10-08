"use client";

import * as React from "react";
import Link from "next/link";
import { Check, CircleSlash, Clock, ShieldOff, TrendingDown } from "lucide-react";
import { chooseInsurer } from "@/app/quote/actions";
import { FlowStep } from "@/components/flow/flow-step";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { StatusBadge } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { coverLabels, quote } from "@/lib/copy";
import type { MotorAddon } from "@/lib/data/motor";
import type { QuoteDraft } from "@/lib/data/quote-provider";
import { addonKey, quoteFormHref, quoteKeys, quoteQuery, quoteResultsHref } from "@/lib/flow/motor-quote";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";
import { formatKes } from "@/lib/format/money";

const copy = quote.compare;

/**
 * Every insurer that covers the vehicle, cheapest first, with what the
 * total is made of. Ticking an extra re-prices every card at once (all
 * combinations are priced on the server, so nothing is calculated here).
 */
export function QuoteCompare({
  details,
  summary,
  offeredAddons,
  pricesByAddons,
  declined,
}: {
  details: Record<string, string>;
  /** "Toyota 2016 · Private car · Comprehensive · KES 1,200,000 · from 12 Oct 2026" */
  summary: string;
  offeredAddons: readonly MotorAddon[];
  pricesByAddons: Record<string, QuoteDraft[]>;
  declined: { insurer: string; years: number }[];
}) {
  const { formAction, pending, errors } = useFlowAction(chooseInsurer);
  const [addons, setAddons] = React.useState<string[]>((details.addons ?? "").split(",").filter(Boolean));
  const current: Record<string, string> = { ...details, addons: addonKey(addons) };
  const quotes = pricesByAddons[current.addons] ?? pricesByAddons[""] ?? [];
  const monthly = details.period === "monthly";

  function handleAddons(event: React.FormEvent<HTMLDivElement>) {
    const boxes = event.currentTarget.querySelectorAll<HTMLInputElement>('input[name="addons"]:checked');
    const next = Array.from(boxes, (box) => box.value);
    setAddons(next);
    // Keep the address in step, so Back and a shared link show the same prices.
    window.history.replaceState(null, "", `?${quoteQuery({ ...details, addons: addonKey(next) })}`);
  }

  if (quotes.length === 0) {
    // Only comprehensive has an age limit, so third party is always there.
    return (
      <FlowStep
        step={{ current: stepOf.phone, total: TOTAL_STEPS }}
        backHref={quoteFormHref(current)}
        title={copy.empty.title}
        description={copy.empty.body}
        helpStep={quote.stepName}
        primaryAction={
          <Button asChild>
            <Link href={quoteResultsHref({ ...details, coverType: "third_party", vehicleValueKes: "", addons: "" })}>{copy.empty.action}</Link>
          </Button>
        }
      >
        <ShieldOff className="size-12 text-ink-quiet" aria-hidden />
      </FlowStep>
    );
  }

  return (
    <FlowStep
      step={{ current: stepOf.phone, total: TOTAL_STEPS }}
      backHref={quoteFormHref(current)}
      title={copy.title(quotes.length)}
      description={copy.description}
      helpStep={quote.stepName}
      formError={errors._form}
    >
      <Card className="gap-2 bg-surface-alt">
        <p className="text-sm text-ink-quiet">{copy.summaryLabel}</p>
        <p className="text-base font-medium text-ink">{summary}</p>
        <TextLink href={quoteFormHref(current)} standalone className="self-start">
          {copy.editDetails}
        </TextLink>
      </Card>

      {offeredAddons.length > 0 && (
        <div onChange={handleAddons} className="flex flex-col gap-1">
          <ChoiceCards
            name="addons"
            label={copy.addonsHeading}
            multiple
            options={offeredAddons.map((addon) => ({ value: addon, ...quote.addons[addon] }))}
            defaultValue={addons}
          />
          <p className="text-sm text-ink-quiet">{copy.addonsHint}</p>
        </div>
      )}

      <p className="flex items-start gap-2 text-sm text-ink-quiet">
        <span className="flex h-5 shrink-0 items-center">
          <Clock className="size-4 text-brand" aria-hidden />
        </span>
        {copy.nextNote}
      </p>

      <ul className="grid gap-3 md:grid-cols-2" aria-live="polite">
        {quotes.map((offer, index) => (
          <li key={offer.insurer} className="flex">
            <QuoteCard
              offer={offer}
              cheapest={index === 0 && quotes.length > 1}
              primary={index === 0}
              monthly={monthly}
            >
              <form action={formAction}>
                {quoteKeys.map((key) => (current[key] ? <input key={key} type="hidden" name={key} value={current[key]} /> : null))}
                <input type="hidden" name="insurer" value={offer.insurer} />
                <Button type="submit" variant={index === 0 ? "primary" : "secondary"} loading={pending} className="w-full">
                  {copy.choose(offer.insurer)}
                </Button>
              </form>
            </QuoteCard>
          </li>
        ))}
      </ul>

      {declined.length > 0 && (
        <Card className="gap-2">
          <h2 className="font-sans text-base font-semibold">{copy.declinedHeading}</h2>
          <ul className="flex flex-col gap-1">
            {declined.map((item) => (
              <li key={item.insurer} className="flex items-start gap-2 text-sm text-ink-quiet">
                <span className="flex h-5 shrink-0 items-center">
                  <CircleSlash className="size-4" aria-hidden />
                </span>
                {copy.declined(item.insurer, item.years)}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-sm text-ink-quiet">{copy.sampleNote}</p>
    </FlowStep>
  );
}

function QuoteCard({
  offer,
  cheapest,
  primary,
  monthly,
  children,
}: {
  offer: QuoteDraft;
  cheapest: boolean;
  primary: boolean;
  monthly: boolean;
  children: React.ReactNode;
}) {
  const b = offer.breakdown;
  const levies = b ? b.trainingLevyKes + b.phcfKes + b.stampDutyKes : 0;
  const excessCovered = b?.addons?.some((addon) => addon.id === "excess_protector");
  const rows = b
    ? [
        { label: copy.breakdown.basic, value: formatKes(b.basicKes) },
        ...(b.addons ?? []).map((addon) => ({
          label: quote.addons[addon.id as MotorAddon]?.label ?? addon.id,
          value: addon.included ? copy.breakdown.included : formatKes(addon.kes),
        })),
        { label: copy.breakdown.levies, value: formatKes(levies) },
      ]
    : [];

  return (
    <Card className={primary ? "w-full gap-4 border-2 border-brand" : "w-full gap-4"}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-lg font-semibold">{offer.insurer}</h2>
          <p className="text-sm text-ink-quiet">{coverLabels[offer.coverType] ?? offer.coverType}</p>
        </div>
        {cheapest && <StatusBadge tone="new" label={copy.cheapest} icon={TrendingDown} />}
      </div>

      <div className="flex flex-col">
        <p className="text-3xl font-semibold text-ink tabular-nums">{formatKes(offer.premiumKes)}</p>
        <p className="text-sm text-ink-quiet">{monthly ? copy.perMonth : copy.perYear}</p>
      </div>

      {rows.length > 0 && (
        <dl className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-ink-quiet">{row.label}</dt>
              <dd className="text-right text-ink tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* With the excess protector added, the breakdown already says so. */}
      {offer.excessKes && !excessCovered ? <p className="text-sm text-ink-quiet">{copy.excess(formatKes(offer.excessKes))}</p> : null}

      {offer.benefits.length > 0 && (
        <ul className="flex flex-1 flex-col gap-1">
          {offer.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
              <span className="flex h-5 shrink-0 items-center">
                <Check className="size-4 text-success" aria-hidden />
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      )}

      {children}
    </Card>
  );
}
