"use server";

import { brand } from "@/lib/brand";
import { flow, productNamesInline, statusMessages } from "@/lib/copy";
import { isProduct, type DocumentType } from "@/lib/data/types";
import { getRepo } from "@/lib/data/repo";
import type { ActionResult } from "@/lib/flow/action-result";
import { getFlowContext, saveAndAdvance } from "@/lib/flow/context";
import { isQuestionScreen, questionScreens, validateScreen } from "@/lib/flow/questions";
import { laterKeyFor, screenHref } from "@/lib/flow/screens";
import {
  codeSchema,
  coverSchema,
  fieldErrors,
  nameSchema,
  phoneSchema,
  plateSchema,
  valueSchema,
  vehicleSchema,
} from "@/lib/flow/validation";
import { getNotifier } from "@/lib/notify";
import { summarize } from "@/lib/products/summary";
import { checkCode, clearPendingCode, getPendingCode, setPendingCode, startSession } from "@/lib/session";

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

// Step 1 — phone and code (SIMULATED: code is always 123456)

export async function sendCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = phoneSchema.safeParse(formData.get("phone") ?? "");
  if (!parsed.success) return fail({ phone: parsed.error.issues[0].message });

  const product = formData.get("product");
  await setPendingCode(parsed.data, isProduct(product) ? product : undefined);
  await getNotifier().send({
    channel: "sms",
    to: parsed.data,
    audience: "client",
    template: "login_code",
    data: { code: "123456" },
  });

  const ref = refFrom(formData);
  return { ok: true, next: ref ? `/start/code?ref=${encodeURIComponent(ref)}` : "/start/code", toast: flow.phone.toast };
}

export async function resendCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const pending = await getPendingCode();
  if (!pending) return { ok: true, next: screenHref("phone") };
  await setPendingCode(pending.phone, pending.product);
  await getNotifier().send({
    channel: "sms",
    to: pending.phone,
    audience: "client",
    template: "login_code",
    data: { code: "123456" },
  });
  const ref = refFrom(formData);
  return { ok: true, next: ref ? `/start/code?ref=${encodeURIComponent(ref)}` : "/start/code", toast: flow.code.resentToast };
}

export async function verifyCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const pending = await getPendingCode();
  if (!pending) return formError(flow.code.errors.noPending);

  const parsed = codeSchema.safeParse(formData.get("code") ?? "");
  if (!parsed.success) return fail({ code: parsed.error.issues[0].message });

  const check = checkCode(parsed.data, pending);
  if (check === "expired") return fail({ code: flow.code.errors.expired });
  if (check === "wrong") return fail({ code: flow.code.errors.wrong });

  const repo = getRepo();
  const client = (await repo.findClientByPhone(pending.phone)) ?? (await repo.createClient({ phone: pending.phone }));
  await startSession(client.id);
  await clearPendingCode();

  const ctx = await getFlowContext(refFrom(formData), pending.product);
  if (ctx.kind === "not_yours") return formError(flow.errors.notYours);
  if (ctx.kind === "submitted") return { ok: true, next: `/my/${ctx.app.ref}`, toast: flow.code.toast };
  if (ctx.kind !== "active") return formError(flow.errors.generic);
  return { ok: true, next: screenHref(ctx.resume, ctx.app.ref), toast: flow.code.toast };
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
  return saveDetails(formData, { coverType: parsed.data });
}

export async function saveValue(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = valueSchema.safeParse(formData.get("value") ?? "");
  if (!parsed.success) return fail({ value: parsed.error.issues[0].message });
  return saveDetails(formData, { vehicleValueKes: parsed.data });
}

export async function saveName(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = nameSchema.safeParse(formData.get("name") ?? "");
  if (!parsed.success) return fail({ name: parsed.error.issues[0].message });

  const { ctx, error } = await activeContext(formData);
  if (error) return error;
  const client = await getRepo().updateClient(ctx.client.id, { name: parsed.data });
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

  const repo = getRepo();
  const app = await repo.submitApplication(ctx.app.ref);
  const notifier = getNotifier();
  const link = `${brand.siteUrl}/my/${app.ref}`;

  // Tell the broker instantly (CLAUDE.md §1 core value 3) — simulated.
  await notifier.send({
    channel: "whatsapp",
    to: "admin",
    audience: "admin",
    template: "application_submitted",
    data: { ref: app.ref, clientName: ctx.client.name, product: productNamesInline[app.product], summary: summarize(app) },
    applicationRef: app.ref,
  });
  // Give the client their link to follow along — simulated.
  await notifier.send({
    channel: "whatsapp",
    to: ctx.client.phone,
    audience: "client",
    template: "status_changed",
    data: {
      firstName: ctx.client.name.split(" ")[0],
      ref: app.ref,
      detail: statusMessages.received.detail,
      linkLabel: statusMessages.received.linkLabel,
      link,
    },
    applicationRef: app.ref,
  });

  return { ok: true, next: `/start/done?ref=${encodeURIComponent(app.ref)}`, toast: flow.review.toast };
}

/** Background upload started: count the document as on its way and move on. */
export async function deferDocument(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const document = formData.get("document");
  const laterKey = typeof document === "string" ? laterKeyFor(document as DocumentType) : undefined;
  if (!laterKey) return formError(flow.errors.generic);
  return saveDetails(formData, { [laterKey]: "uploading" });
}
