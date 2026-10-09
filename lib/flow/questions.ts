import { questionErrors, questions, quote } from "@/lib/copy";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { needsSeats, needsTonnage, offersMonthly } from "@/lib/data/motor";

/**
 * Declarative question screens for health, travel and business (motor keeps
 * its bespoke screens). One config drives the screen, the validation, the
 * review summary and the admin's answer list — so adding or changing a
 * question is a data change, not a new screen. Words live in lib/copy.
 */

export type FieldKind = "choice" | "multi" | "select" | "text" | "number" | "money" | "date";

type Option = { value: string; label: string; description?: string };

export type QuestionField = {
  name: string;
  kind: FieldKind;
  label: string;
  hint?: string;
  options?: readonly Option[];
  optional?: boolean;
  min?: number;
  max?: number;
  /** Only ask this when it makes sense for earlier answers. */
  showIf?: (details: Record<string, string>) => boolean;
  autoComplete?: string;
};

export type QuestionScreenConfig = {
  id: QuestionScreenId;
  title: string;
  description?: string;
  reassurance?: string;
  stepName: string;
  fields: QuestionField[];
  /** Cross-field checks: return { fieldName: message } for problems. */
  check?: (values: Record<string, string>) => Record<string, string>;
};

export type QuestionScreenId =
  | "category"
  | "who"
  | "ages"
  | "plan"
  | "limit"
  | "conditions"
  | "destination"
  | "dates"
  | "travellers"
  | "purpose"
  | "business"
  | "covers"
  | "size";

const q = questions;
const withPartner = (d: Record<string, string>) => d.who === "me_partner" || d.who === "family";
const withChildren = (d: Record<string, string>) => d.who === "family" || d.who === "children";
const coversInclude = (d: Record<string, string>, ...values: string[]) =>
  (d.covers ?? "").split(",").some((value) => values.includes(value));

const MAX_TRIP_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

export const questionScreens: Record<QuestionScreenId, QuestionScreenConfig> = {
  category: {
    id: "category",
    ...pick(q.category),
    fields: [
      { name: "category", kind: "choice", ...q.category.fields.category },
      { name: "seats", kind: "number", ...q.category.fields.seats, min: 7, max: 90, showIf: (d) => needsSeats(d.category) },
      { name: "tonnage", kind: "choice", ...quote.form.fields.tonnage, showIf: (d) => needsTonnage(d.category) },
      { name: "period", kind: "choice", ...q.category.fields.period, showIf: (d) => offersMonthly(d.category) },
    ],
  },
  who: {
    id: "who",
    ...pick(q.who),
    fields: [{ name: "who", kind: "choice", ...q.who.fields.who }],
  },
  ages: {
    id: "ages",
    ...pick(q.ages),
    fields: [
      { name: "principalAge", kind: "number", ...q.ages.fields.principalAge, min: 18, max: 85 },
      { name: "partnerAge", kind: "number", ...q.ages.fields.partnerAge, min: 18, max: 85, showIf: withPartner },
      { name: "childrenCount", kind: "number", ...q.ages.fields.childrenCount, min: 1, max: 8, showIf: withChildren },
    ],
  },
  plan: {
    id: "plan",
    ...pick(q.plan),
    fields: [{ name: "plan", kind: "choice", ...q.plan.fields.plan }],
  },
  limit: {
    id: "limit",
    ...pick(q.limit),
    fields: [{ name: "limit", kind: "choice", ...q.limit.fields.limit }],
  },
  conditions: {
    id: "conditions",
    ...pick(q.conditions),
    reassurance: q.conditions.reassurance,
    fields: [
      { name: "conditions", kind: "choice", ...q.conditions.fields.conditions },
      {
        name: "conditionsNote",
        kind: "text",
        ...q.conditions.fields.conditionsNote,
        showIf: (d) => d.conditions === "yes",
      },
    ],
  },
  destination: {
    id: "destination",
    ...pick(q.destination),
    fields: [{ name: "region", kind: "select", ...q.destination.fields.region }],
  },
  dates: {
    id: "dates",
    ...pick(q.dates),
    fields: [
      { name: "departDate", kind: "date", ...q.dates.fields.departDate },
      { name: "returnDate", kind: "date", ...q.dates.fields.returnDate },
    ],
    check: (values) => {
      const depart = Date.parse(values.departDate);
      const back = Date.parse(values.returnDate);
      const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
      const errors: Record<string, string> = {};
      if (depart < today) errors.departDate = questionErrors.dateFuture;
      if (back <= depart) errors.returnDate = questionErrors.returnAfterDeparture;
      else if ((back - depart) / DAY_MS > MAX_TRIP_DAYS) errors.returnDate = questionErrors.tripTooLong;
      return errors;
    },
  },
  travellers: {
    id: "travellers",
    ...pick(q.travellers),
    fields: [
      { name: "travellers", kind: "number", ...q.travellers.fields.travellers, min: 1, max: 10 },
      { name: "oldestAge", kind: "number", ...q.travellers.fields.oldestAge, min: 0, max: 90 },
    ],
  },
  purpose: {
    id: "purpose",
    ...pick(q.purpose),
    fields: [{ name: "purpose", kind: "choice", ...q.purpose.fields.purpose }],
  },
  business: {
    id: "business",
    ...pick(q.business),
    fields: [
      { name: "businessName", kind: "text", ...q.business.fields.businessName, autoComplete: "organization" },
      { name: "businessType", kind: "select", ...q.business.fields.businessType },
      { name: "town", kind: "text", ...q.business.fields.town, autoComplete: "address-level2" },
    ],
  },
  covers: {
    id: "covers",
    ...pick(q.covers),
    fields: [{ name: "covers", kind: "multi", ...q.covers.fields.covers }],
  },
  size: {
    id: "size",
    ...pick(q.size),
    fields: [
      { name: "staffCount", kind: "number", ...q.size.fields.staffCount, min: 0, max: 500 },
      {
        name: "contentsValueKes",
        kind: "money",
        ...q.size.fields.contentsValueKes,
        min: 10_000,
        max: 500_000_000,
        showIf: (d) => coversInclude(d, "stock_contents", "building", "transit"),
      },
    ],
  },
};

function pick(source: { title: string; description?: string; stepName: string }) {
  return { title: source.title, description: source.description, stepName: source.stepName };
}

export function isQuestionScreen(value: string): value is QuestionScreenId {
  return value in questionScreens;
}

/** Fields that apply given the answers so far. */
export function activeFields(screen: QuestionScreenConfig, details: Record<string, string>): QuestionField[] {
  return screen.fields.filter((field) => !field.showIf || field.showIf(details));
}

/** A screen is answered when every required, applicable field has a value. */
export function isAnswered(screen: QuestionScreenConfig, details: Record<string, string>): boolean {
  return activeFields(screen, details).every((field) => field.optional || Boolean(details[field.name]));
}

const toNumber = (value: string) => Number(value.replace(/[,\s]/g, ""));

/**
 * Validate one screen's form values. Returns the cleaned values to save, or
 * field errors. Values for fields that no longer apply are cleared.
 */
export function validateScreen(
  screen: QuestionScreenConfig,
  raw: Record<string, string>,
  details: Record<string, string>,
): { ok: true; values: Record<string, string> } | { ok: false; errors: Record<string, string> } {
  // showIf may depend on answers on this same screen (e.g. conditions -> note).
  const merged = { ...details, ...raw };
  const errors: Record<string, string> = {};
  const values: Record<string, string> = {};

  for (const field of screen.fields) {
    if (field.showIf && !field.showIf(merged)) {
      values[field.name] = "";
      continue;
    }
    const value = (raw[field.name] ?? "").trim();
    if (!value) {
      if (!field.optional) {
        errors[field.name] =
          field.kind === "multi"
            ? questionErrors.chooseAtLeastOne
            : field.kind === "choice" || field.kind === "select"
              ? questionErrors.choose(field.label)
              : questionErrors.required(field.label);
      }
      values[field.name] = "";
      continue;
    }

    switch (field.kind) {
      case "choice":
      case "select":
        if (!field.options?.some((option) => option.value === value)) errors[field.name] = questionErrors.choose(field.label);
        else values[field.name] = value;
        break;
      case "multi": {
        const picked = value.split(",").filter((item) => field.options?.some((option) => option.value === item));
        if (picked.length === 0) errors[field.name] = questionErrors.chooseAtLeastOne;
        else values[field.name] = picked.join(",");
        break;
      }
      case "number": {
        const n = toNumber(value);
        const min = field.min ?? 0;
        const max = field.max ?? 1_000_000;
        if (!Number.isInteger(n) || n < min || n > max) errors[field.name] = questionErrors.number(min, max);
        else values[field.name] = String(n);
        break;
      }
      case "money": {
        const n = toNumber(value);
        const min = field.min ?? 1;
        const max = field.max ?? 1_000_000_000;
        if (!Number.isFinite(n) || n < min || n > max) errors[field.name] = questionErrors.money(formatKes(min), formatKes(max));
        else values[field.name] = String(Math.round(n));
        break;
      }
      case "date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) errors[field.name] = questionErrors.date;
        else values[field.name] = value;
        break;
      default:
        values[field.name] = value.slice(0, 200);
    }
  }

  if (Object.keys(errors).length === 0 && screen.check) Object.assign(errors, screen.check(values));
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}

/** Human-readable value for review screens and admin answers. */
export function displayValue(field: QuestionField, value: string | undefined): string | undefined {
  if (!value) return undefined;
  switch (field.kind) {
    case "choice":
    case "select":
      return field.options?.find((option) => option.value === value)?.label ?? value;
    case "multi":
      return value
        .split(",")
        .map((item) => field.options?.find((option) => option.value === item)?.label ?? item)
        .join(", ");
    case "money":
      return formatKes(Number(value));
    case "date":
      return formatDate(value);
    default:
      return value;
  }
}

/** All answer rows for a set of screens, for review and admin. */
export function answerRows(screenIds: readonly QuestionScreenId[], details: Record<string, string>) {
  return screenIds.flatMap((id) =>
    activeFields(questionScreens[id], details).map((field) => ({
      label: field.label,
      value: displayValue(field, details[field.name]),
    })),
  );
}
