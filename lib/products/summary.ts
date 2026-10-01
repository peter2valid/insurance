import { coverLabels, productNames, summaries } from "@/lib/copy";
import type { Application, Product } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";
import { questionScreens } from "@/lib/flow/questions";

/**
 * One-line description of an application, used on the status page, the
 * admin board and in notifications. Pure, so client and admin always agree.
 */

function optionLabel(screen: keyof typeof questionScreens, field: string, value?: string) {
  if (!value) return undefined;
  return questionScreens[screen].fields.find((f) => f.name === field)?.options?.find((o) => o.value === value)?.label;
}

/** How many people a health application covers. */
export function peopleCovered(details: Record<string, string>): number {
  const children = Number(details.childrenCount || 0);
  switch (details.who) {
    case "me":
      return 1;
    case "me_partner":
      return 2;
    case "family":
      return 2 + children;
    case "children":
      return Math.max(children, 1);
    default:
      return 1;
  }
}

export function summarize(app: Application): string {
  const d = app.details;
  let parts: (string | undefined)[] = [];

  switch (app.product) {
    case "motor":
      parts = [[d.make, d.model].filter(Boolean).join(" ") || undefined, d.plate];
      break;
    case "health":
      parts = d.who ? [summaries.people(peopleCovered(d)), d.plan ? coverLabels[d.plan] : undefined] : [];
      break;
    case "travel":
      parts = [
        optionLabel("destination", "region", d.region),
        d.departDate && d.returnDate ? summaries.dateRange(formatDate(d.departDate), formatDate(d.returnDate)) : undefined,
      ];
      break;
    case "business":
      parts = [d.businessName, optionLabel("business", "businessType", d.businessType)];
      break;
  }

  const text = parts.filter(Boolean).join(" · ");
  return text || summaries.noDetails;
}

/** "Health · 3 people · Inpatient and outpatient" */
export function summarizeWithProduct(app: Application): string {
  return `${productNames[app.product]} · ${summarize(app)}`;
}

export function productName(product: Product): string {
  return productNames[product];
}
