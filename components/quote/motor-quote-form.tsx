"use client";

import * as React from "react";
import {
  BusFront,
  Car,
  CarFront,
  CarTaxiFront,
  KeyRound,
  Motorbike,
  School,
  Scooter,
  Truck,
  Van,
  type LucideIcon,
} from "lucide-react";
import { getMotorQuotes } from "@/app/quote/actions";
import { FlowStep } from "@/components/flow/flow-step";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { flow, questions, quote } from "@/lib/copy";
import { coversFor, makesFor, needsSeats, needsTonnage, offersMonthly, OLDEST_YEAR, type VehicleCategory } from "@/lib/data/motor";
import { stepOf, TOTAL_STEPS } from "@/lib/flow/screens";

const copy = quote.form;
const fields = copy.fields;
const OTHER_MAKE = "Other";

/** One picture per class, so the right tile is found at a glance. (No tuk-tuk icon exists; the label carries it.) */
const categoryIcons: Record<VehicleCategory, LucideIcon> = {
  private: Car,
  psv_taxi: CarTaxiFront,
  car_hire: KeyRound,
  psv_matatu: BusFront,
  institutional: School,
  commercial: Van,
  general_cartage: Truck,
  motorcycle: Motorbike,
  motorcycle_private: Scooter,
  tuktuk: CarFront,
};

const categoryOptions = questions.category.fields.category.options.map((option) => ({
  ...option,
  icon: categoryIcons[option.value as VehicleCategory],
}));

const years = (() => {
  const latest = new Date().getFullYear();
  return Array.from({ length: latest - OLDEST_YEAR + 1 }, (_, i) => String(latest - i)).map((y) => ({ value: y, label: y }));
})();

const tonnageOptions = fields.tonnage.options.map((option) => ({
  value: option.value,
  label: `${option.label} — ${option.description.toLowerCase()}`,
}));

/**
 * The instant quote (step 1), asked the way an agent would: first what the
 * vehicle is used for (one tap), then only what that class needs — seats
 * for buses, tonnage for goods vehicles, cover period for PSVs.
 */
export function MotorQuoteForm({
  values,
  today,
  lastStartDate,
}: {
  values: Record<string, string>;
  /** Nairobi dates from the server (yyyy-mm-dd), so server and browser agree. */
  today: string;
  lastStartDate: string;
}) {
  const { formAction, pending, errors, submitted } = useFlowAction(getMotorQuotes);
  const initial = submitted.category !== undefined ? submitted : values;
  const [category, setCategory] = React.useState(initial.category ?? "");
  const [coverType, setCoverType] = React.useState(initial.coverType || "comprehensive");
  const restRef = React.useRef<HTMLDivElement>(null);

  const allowedCovers = coversFor(category || undefined);
  const coverOptions = flow.cover.options.filter((option) => allowedCovers.includes(option.value));
  const cover = allowedCovers.includes(coverType as never) ? coverType : "comprehensive";
  const makes = [...makesFor(category), OTHER_MAKE].map((make) => ({
    value: make,
    label: make === OTHER_MAKE ? fields.make.other : make,
  }));

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.name === "category") {
      const first = !category;
      setCategory(target.value);
      // First pick on a phone: bring the next questions into view.
      if (first) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        requestAnimationFrame(() => restRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" }));
      }
    }
    if (target.name === "coverType") setCoverType(target.value);
  }

  return (
    <FlowStep
      as="form"
      action={formAction}
      onChange={handleChange}
      noValidate
      step={{ current: stepOf.phone, total: TOTAL_STEPS }}
      backHref="/"
      title={copy.title}
      description={copy.description}
      reassurance={copy.reassurance}
      helpStep={quote.stepName}
      formError={errors._form}
      primaryAction={
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      }
    >
      <ChoiceCards
        name="category"
        label={fields.category.label}
        layout="tiles"
        options={categoryOptions}
        defaultValue={initial.category ?? ""}
        error={errors.category}
      />

      {category && (
        <div ref={restRef} className="flex scroll-mt-4 flex-col gap-4">
          {needsSeats(category) && (
            <Input
              name="seats"
              label={fields.seats.label}
              hint={fields.seats.hint}
              inputMode="numeric"
              autoComplete="off"
              defaultValue={initial.seats}
              error={errors.seats}
            />
          )}
          {needsTonnage(category) && (
            <Select
              name="tonnage"
              label={fields.tonnage.label}
              hint={fields.tonnage.hint}
              options={tonnageOptions}
              defaultValue={initial.tonnage ?? ""}
              error={errors.tonnage}
            />
          )}
          {offersMonthly(category) && (
            <ChoiceCards
              name="period"
              label={fields.period.label}
              options={questions.category.fields.period.options}
              defaultValue={initial.period || "annual"}
              error={errors.period}
            />
          )}

          <ChoiceCards
            // Re-mount when the list changes, so a hidden choice isn't kept.
            key={allowedCovers.join()}
            name="coverType"
            label={fields.coverType.label}
            options={coverOptions}
            defaultValue={cover}
            error={errors.coverType}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              key={`make-${category}`}
              name="make"
              label={fields.make.label}
              options={makes}
              defaultValue={makes.some((make) => make.value === initial.make) ? initial.make : ""}
              error={errors.make}
            />
            <Select name="year" label={fields.year.label} options={years} defaultValue={initial.year ?? ""} error={errors.year} />
          </div>

          {cover !== "third_party" && (
            <Input
              name="vehicleValueKes"
              label={fields.value.label}
              hint={fields.value.hint}
              prefix={flow.value.prefix}
              inputMode="numeric"
              autoComplete="off"
              defaultValue={initial.vehicleValueKes ? Number(initial.vehicleValueKes.replace(/,/g, "")).toLocaleString("en-KE") : ""}
              error={errors.vehicleValueKes}
            />
          )}

          <Input
            name="startDate"
            type="date"
            label={fields.startDate.label}
            hint={fields.startDate.hint}
            min={today}
            max={lastStartDate}
            defaultValue={initial.startDate || today}
            error={errors.startDate}
          />
        </div>
      )}

      {/* Extras chosen on the comparison stay chosen when coming back to change details. */}
      {initial.addons && <input type="hidden" name="addons" value={initial.addons} />}
    </FlowStep>
  );
}
