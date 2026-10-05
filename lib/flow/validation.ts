import { z } from "zod";
import { flow } from "@/lib/copy";
import { coverTypes } from "@/lib/data/products";
import { normalizeKenyanPhone } from "@/lib/format/phone";

/**
 * Zod schemas for each flow screen. Shared by the browser (instant
 * feedback) and the server (the real check). Messages come from lib/copy.
 */

export const phoneSchema = z
  .string()
  .trim()
  .min(1, flow.phone.errors.required)
  .transform((value, ctx) => {
    const e164 = normalizeKenyanPhone(value);
    if (!e164) {
      ctx.addIssue({ code: "custom", message: flow.phone.errors.invalid });
      return z.NEVER;
    }
    return e164;
  });

export const codeSchema = z
  .string()
  .trim()
  .min(1, flow.code.errors.required)
  .regex(/^\d{6}$/, flow.code.errors.required);

/**
 * Kenyan plates: cars KAA 123A (older KAA 123), motorcycles KMEX 123A.
 * Diplomatic and GK plates are out of scope.
 */
export const plateSchema = z
  .string()
  .trim()
  .min(1, flow.vehicle.errors.required)
  .transform((value) => value.toUpperCase().replace(/\s+/g, ""))
  .refine((value) => /^K[A-Z]{2,3}\d{3}[A-Z]?$/.test(value), flow.vehicle.errors.invalid)
  .transform((value) => value.replace(/^([A-Z]+)(\d.*)$/, "$1 $2"));

export const emailSchema = z
  .string()
  .trim()
  .max(120, flow.name.errors.email)
  .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), flow.name.errors.email)
  .transform((value) => value.toLowerCase());

const thisYear = new Date().getFullYear();
const required = (label: string) => z.string().trim().min(1, flow.confirm.errors.required(label));

export const vehicleSchema = z.object({
  plate: plateSchema,
  make: required(flow.confirm.fields.make),
  model: required(flow.confirm.fields.model),
  year: z
    .string()
    .trim()
    .refine((value) => {
      const year = Number(value);
      return Number.isInteger(year) && year >= 1980 && year <= thisYear;
    }, flow.confirm.errors.year),
  chassisNumber: required(flow.confirm.fields.chassisNumber).transform((v) => v.toUpperCase()),
  bodyType: z.string().trim().optional().default(""),
  ownerName: z.string().trim().optional().default(""),
});
export type VehicleInput = z.input<typeof vehicleSchema>;

export const coverSchema = z.enum(coverTypes, { error: flow.cover.errors.required });

export const valueSchema = z
  .string()
  .trim()
  .min(1, flow.value.errors.required)
  .transform((value) => Number(value.replace(/[,\s]/g, "")))
  .refine((n) => Number.isFinite(n) && n >= 50_000 && n <= 50_000_000, flow.value.errors.invalid)
  .transform((n) => String(Math.round(n)));

export const nameSchema = z
  .string()
  .trim()
  .min(3, flow.name.errors.required)
  .refine((value) => value.includes(" "), flow.name.errors.required);

/** First error message per field, for showing next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}
