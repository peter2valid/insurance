"use server";

import { z } from "zod";
import * as workflow from "@/lib/admin/workflow";
import { getRepo } from "@/lib/data/repo";
import { admin } from "@/lib/copy";
import { allCoverTypes } from "@/lib/data/products";
import type { ActionResult } from "@/lib/flow/action-result";
import { fieldErrors } from "@/lib/flow/validation";

/**
 * Admin server actions. Thin wrappers: validate the form, call the
 * workflow, and return a toast. SIMULATED: there is no admin sign-in yet.
 */

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

async function run(ref: string, work: () => Promise<string>): Promise<ActionResult> {
  try {
    const toast = await work();
    return { ok: true, next: `/admin/${ref}`, toast };
  } catch (error) {
    const message = error instanceof workflow.WorkflowError ? error.message : admin.errors.generic;
    return { ok: false, errors: { _form: message } };
  }
}

export async function nudgeAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const result = await run(ref, async () => {
    await workflow.nudge(ref);
    return admin.toasts.nudged;
  });
  // From the board, stay on the board.
  return result.ok && formData.get("from") === "board" ? { ...result, next: "/admin" } : result;
}

export async function verifyAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(ref, async () => {
    const { allVerified } = await workflow.verifyDocument(ref, text(formData, "documentId"));
    return allVerified ? admin.toasts.verifiedAll : admin.toasts.verified;
  });
}

export async function reuploadAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const reason = admin.reupload.reasons.find((item) => item.value === text(formData, "reason"));
  if (!reason) return { ok: false, errors: { reason: admin.reupload.errors.reason } };
  return run(ref, async () => {
    await workflow.requestReupload(ref, text(formData, "documentId"), reason.message);
    return admin.toasts.reuploadRequested;
  });
}

const money = (message: string) =>
  z
    .string()
    .trim()
    .transform((value) => Number(value.replace(/[,\s]/g, "")))
    .refine((n) => Number.isFinite(n) && n > 0 && n < 100_000_000, message);

const quoteSchema = z.object({
  insurer: z.string().trim().min(2, admin.quoteForm.errors.insurer),
  coverType: z.string().refine((value) => allCoverTypes.includes(value), admin.quoteForm.errors.coverType),
  premium: money(admin.quoteForm.errors.premium),
  excess: z.union([z.literal(""), money(admin.quoteForm.errors.excess)]),
  benefits: z.string().optional().default(""),
});

export async function addQuoteAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const q = parsed.data;
  return run(ref, async () => {
    await workflow.addQuote(ref, {
      insurer: q.insurer,
      coverType: q.coverType,
      premiumKes: Math.round(q.premium),
      excessKes: q.excess === "" ? undefined : Math.round(q.excess),
      benefits: q.benefits
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    return admin.toasts.quoteAdded;
  });
}

export async function quotesReadyAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(ref, async () => {
    await workflow.markQuotesReady(ref);
    return admin.toasts.quotesReady;
  });
}

export async function coveredAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const result = await run(ref, async () => {
    await workflow.markCovered(ref);
    return admin.toasts.covered;
  });
  return result.ok && formData.get("from") === "board" ? { ...result, next: "/admin" } : result;
}

/** Demo only (Stage 10): restore the sample applications and clear the outbox. */
export async function resetDemoAction(): Promise<ActionResult> {
  await getRepo().reset();
  return { ok: true, next: "/admin", toast: admin.demo.toast };
}

export async function sendQuotesAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const result = await run(ref, async () => {
    await workflow.sendSuggestedQuotes(ref);
    return admin.toasts.quotesSent;
  });
  return result.ok && formData.get("from") === "board" ? { ...result, next: "/admin" } : result;
}

export async function verifyAllAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(ref, async () => {
    const { allVerified } = await workflow.verifyAllDocuments(ref);
    return allVerified ? admin.toasts.verifiedAll : admin.toasts.verified;
  });
}
