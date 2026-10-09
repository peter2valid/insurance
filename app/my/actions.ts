"use server";

import * as workflow from "@/lib/admin/workflow";
import { statusPage } from "@/lib/copy";
import type { ActionResult } from "@/lib/flow/action-result";
import { getFlowContext } from "@/lib/flow/context";
import { startSession } from "@/lib/session";
import { phoneSchema } from "@/lib/flow/validation";
import { getPaymentProvider } from "@/lib/payments";

/** Client picks one of the quotes on their status page. */
export async function chooseCover(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = formData.get("ref");
  const quoteId = formData.get("quoteId");
  if (typeof ref !== "string" || typeof quoteId !== "string") {
    return { ok: false, errors: { _form: statusPage.quotes.errors.notReady } };
  }

  const ctx = await getFlowContext(ref);
  if (ctx.kind !== "submitted" || ctx.app.status !== "quotes_ready") {
    return { ok: false, errors: { _form: statusPage.quotes.errors.notReady } };
  }

  try {
    await workflow.clientChoseQuote(ref, quoteId);
  } catch {
    return { ok: false, errors: { _form: statusPage.quotes.errors.notReady } };
  }

  return { ok: true, next: `/my/${ref}#payment`, toast: statusPage.quotes.chosenToast };
}

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/** "Send payment request": an M-Pesa STK push to the client's phone (SIMULATED). */
export async function startPayment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const phone = phoneSchema.safeParse(text(formData, "phone"));
  if (!phone.success) return { ok: false, errors: { phone: statusPage.pay.errors.phone } };
  const ctx = await getFlowContext(ref);
  if (ctx.kind !== "submitted" || ctx.app.status !== "cover_chosen") {
    return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  }
  try {
    await workflow.requestPayment(ref, phone.data);
  } catch {
    return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  }
  return { ok: true, next: `/my/${ref}#payment`, toast: statusPage.pay.sentToast };
}

/**
 * DEMO ONLY: plays the part of the client's phone approving the M-Pesa
 * request. Refused when a real payment provider is in use.
 */
export async function approveDemoPayment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const paymentId = text(formData, "paymentId");
  if (!getPaymentProvider().simulated) return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  const ctx = await getFlowContext(ref);
  if (ctx.kind !== "submitted" || ctx.app.status !== "cover_chosen") {
    return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  }
  try {
    await workflow.confirmPayment(paymentId);
  } catch {
    return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  }
  return { ok: true, next: `/my/${ref}`, toast: statusPage.pay.paidToast };
}

/** "Renew now": last year's answers and documents, sent straight to new quotes. */
export async function renewCover(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const ctx = await getFlowContext(ref);
  if (ctx.kind !== "submitted" || ctx.app.status !== "covered") {
    return { ok: false, errors: { _form: statusPage.pay.errors.notReady } };
  }
  const renewal = await workflow.startRenewal(ref);
  // The renewal is a new application: let this phone open it.
  await startSession(ctx.client.id, renewal);
  return { ok: true, next: `/my/${renewal}#quotes`, toast: statusPage.policy.renewed };
}
