"use server";

import { flow } from "@/lib/copy";
import { isProduct, type DocumentType } from "@/lib/data/types";
import { getRepo } from "@/lib/data/repo";
import type { ActionResult } from "@/lib/flow/action-result";
import { applyPendingQuote, getFlowContext, saveAndAdvance } from "@/lib/flow/context";
import { isQuestionScreen, questionScreens, validateScreen } from "@/lib/flow/questions";
import { laterKeyFor, screenHref } from "@/lib/flow/screens";
import {
  coverSchema,
  fieldErrors,
  emailSchema,
  nameSchema,
  phoneSchema,
  plateSchema,
  valueSchema,
  vehicleSchema,
} from "@/lib/flow/validation";
import * as workflow from "@/lib/admin/workflow";
import { startSession } from "@/lib/session";

/**
 * Server actions for the client flow. Each returns a result object (never
 * throws for expected problems) so the screen can show the error next to
 * the field, or toast and move on.
 */

const fail = (errors: Record<string, string>): ActionResult => ({ ok: false, errors });
const formError = (message: string) => fail({ _form: message });

function refFrom(formData: FormData): string | null {
  const ref = formData.get("ref");
  return typeof ref === "string" && ref ? ref : null;
}

/** Guard shared by every step after sign-in. */
async function activeContext(formData: FormData) {
  const ctx = await getFlowContext(refFrom(formData));
  if (ctx.kind === "signed_out") return { error: { ok: true as const, next: screenHref("phone") } };
  if (ctx.kind === "not_yours") return { error: formError(flow.errors.notYours) };
  if (ctx.kind === "submitted") return { error: { ok: true as const, next: `/my/${ctx.app.ref}` } };
  return { ctx };
}

// Step 1 — who you are: name, phone, optional email. No code (see lib/session.ts).

export async function startApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const name = nameSchema.safeParse(formData.get("name") ?? "");
  const phone = phoneSchema.safeParse(formData.get("phone") ?? "");
  const email = emailSchema.safeParse(formData.get("email") ?? "");
  const errors: Record<string, string> = {};
  if (!name.success) errors.name = name.error.issues[0].message;
  if (!phone.success) errors.phone = phone.error.issues[0].message;
  if (!email.success) errors.email = email.error.issues[0].message;
  if (!name.success || !phone.success || !email.success) return fail(errors);

  const repo = getRepo();
  const existing = await repo.findClientByPhone(phone.data);
  const client = existing ?? (await repo.createClient({ phone: phone.data, name: name.data }));
  // Fill gaps only: an unverified form never overwrites a client's saved name or email.
  const gaps = {
    ...(!client.name && { name: name.data }),
    ...(!client.email && email.data && { email: email.data }),
  };
  if (Object.keys(gaps).length > 0) await repo.updateClient(client.id, gaps);
  const session = await startSession(client.id);

  // Chose an insurer before this step: carry on with that quote.
  const product = formData.get("product");
  const wanted = isProduct(product) ? product : undefined;
  const quoted = wanted && wanted !== "motor" ? null : await applyPendingQuote(session);
  const ctx = await getFlowContext(quoted?.ref ?? refFrom(formData), wanted);
  if (ctx.kind === "not_yours") return formError(flow.errors.notYours);
  if (ctx.kind === "submitted") return { ok: true, next: `/my/${ctx.app.ref}` };
  if (ctx.kind !== "active") return formError(flow.errors.generic);

  // The name and email given for THIS application (what the review and the broker see).
  const { app, next } = await saveAndAdvance(ctx.app, ctx.client, {
    applicantName: name.data,
    applicantEmail: email.data ?? "",
  });
  return { ok: true, next: screenHref(next, app.ref), toast: flow.phone.toast };
}

// Steps 2–4 — one answer per screen

async function saveDetails(formData: FormData, details: Record<string, string>, toast?: string): Promise<ActionResult> {
  const { ctx, error } = await activeContext(formData);
  if (error) return error;
  const { app, next } = await saveAndAdvance(ctx.app, ctx.client, details);
  return { ok: true, next: screenHref(next, app.ref), toast };
}

export async function savePlate(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = plateSchema.safeParse(formData.get("plate") ?? "");
  if (!parsed.success) return fail({ plate: parsed.error.issues[0].message });
  return saveDetails(formData, { plate: parsed.data });
}

export async function skipLogbook(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return saveDetails(formData, { logbookLater: "yes" });
}

export async function confirmVehicle(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail(fieldErrors(parsed.error));
  return saveDetails(formData, { ...parsed.data, vehicleConfirmed: "yes", lowConfidence: "" }, flow.confirm.toast);
}

export async function saveCover(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = coverSchema.safeParse(formData.get("coverType"));
  if (!parsed.success) return fail({ coverType: flow.cover.errors.required });
  // Third party only needs no value: clear an old one so quotes stay right.
  return saveDetails(formData, { coverType: parsed.data, ...(parsed.data === "third_party" ? { vehicleValueKes: "" } : {}) });
}

export async function saveValue(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = valueSchema.safeParse(formData.get("value") ?? "");
  if (!parsed.success) return fail({ value: parsed.error.issues[0].message });
  return saveDetails(formData, { vehicleValueKes: parsed.data });
}

export async function saveName(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = nameSchema.safeParse(formData.get("name") ?? "");
  const email = emailSchema.safeParse(formData.get("email") ?? "");
  const errors: Record<string, string> = {};
  if (!parsed.success) errors.name = parsed.error.issues[0].message;
  if (!email.success) errors.email = email.error.issues[0].message;
  if (!parsed.success || !email.success) return fail(errors);

  const { ctx, error } = await activeContext(formData);
  if (error) return error;
  const client = await getRepo().updateClient(ctx.client.id, {
    name: parsed.data,
    ...(email.data ? { email: email.data } : {}),
  });
  const { app, next } = await saveAndAdvance(ctx.app, client, {});
  return { ok: true, next: screenHref(next, app.ref) };
}

export async function skipId(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return saveDetails(formData, { idLater: "yes" });
}

/** "I'll upload it later" for any document asked for in the flow. */
export async function skipDocument(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const document = formData.get("document");
  const laterKey = typeof document === "string" ? laterKeyFor(document as DocumentType) : undefined;
  if (!laterKey) return formError(flow.errors.generic);
  return saveDetails(formData, { [laterKey]: "yes" });
}

/**
 * Every declarative question screen (health, travel, business) saves here.
 * The screen's config decides which fields apply and how to check them.
 */
export async function saveAnswers(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const screenId = formData.get("screen");
  if (typeof screenId !== "string" || !isQuestionScreen(screenId)) return formError(flow.errors.generic);
  const screen = questionScreens[screenId];

  const { ctx, error } = await activeContext(formData);
  if (error) return error;

  // Multi-choice fields arrive as several values with the same name.
  const raw: Record<string, string> = {};
  for (const field of screen.fields) {
    raw[field.name] = field.kind === "multi" ? formData.getAll(field.name).map(String).join(",") : String(formData.get(field.name) ?? "");
  }

  const result = validateScreen(screen, raw, ctx.app.details);
  if (!result.ok) return fail(result.errors);
  const { app, next } = await saveAndAdvance(ctx.app, ctx.client, result.values);
  return { ok: true, next: screenHref(next, app.ref) };
}

// Step 5 — send

export async function submitApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { ctx, error } = await activeContext(formData);
  if (error) return error;
  if (ctx.resume !== "review") return { ok: true, next: screenHref(ctx.resume, ctx.app.ref) };

  const app = await getRepo().submitApplication(ctx.app.ref);
  // Tell the broker instantly and, with auto-quote on, price every insurer now.
  await workflow.applicationSubmitted(app.ref);

  // Insurer already chosen: straight to payment.
  if (app.details.insurer && (await getRepo().getApplication(app.ref))?.status === "cover_chosen") {
    return { ok: true, next: `/my/${app.ref}#payment`, toast: flow.review.toast };
  }
  return { ok: true, next: `/start/done?ref=${encodeURIComponent(app.ref)}`, toast: flow.review.toast };
}

/** Background upload started: count the document as on its way and move on. */
export async function deferDocument(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const document = formData.get("document");
  const laterKey = typeof document === "string" ? laterKeyFor(document as DocumentType) : undefined;
  if (!laterKey) return formError(flow.errors.generic);
  return saveDetails(formData, { [laterKey]: "uploading" });
}
