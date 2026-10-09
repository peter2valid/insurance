"use server";

import { z } from "zod";
import * as workflow from "@/lib/admin/workflow";
import { runAutomations } from "@/lib/automation";
import { getRepo } from "@/lib/data/repo";
import { admin } from "@/lib/copy";
import { allCoverTypes } from "@/lib/data/products";
import type { ActionResult } from "@/lib/flow/action-result";
import { emailSchema, fieldErrors, phoneSchema } from "@/lib/flow/validation";
import { formatKes } from "@/lib/format/money";
import { isAdmin, signInAdmin, signOutAdmin } from "@/lib/session";

/**
 * Admin server actions. Thin wrappers: check the admin is signed in (when
 * ADMIN_PASSWORD is set), validate the form, call the workflow, and return
 * a toast.
 */

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

const denied: ActionResult = { ok: true, next: "/admin/login" };

async function run(next: string, work: () => Promise<string>): Promise<ActionResult> {
  if (!(await isAdmin())) return denied;
  try {
    const toast = await work();
    return { ok: true, next, toast };
  } catch (error) {
    const message = error instanceof workflow.WorkflowError ? error.message : admin.errors.generic;
    return { ok: false, errors: { _form: message } };
  }
}

/** Board actions stay on the page they came from. */
const back = (formData: FormData, ref: string) => {
  const from = text(formData, "from");
  if (from === "board") return "/admin/applications";
  if (from === "today") return "/admin";
  return `/admin/${ref}`;
};

export async function nudgeAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(back(formData, ref), async () => {
    const delivery = await workflow.nudge(ref);
    if (delivery === "sent") return admin.toasts.nudgeSent;
    if (delivery === "failed") return admin.toasts.nudgeFailed;
    const { twilioConfigured } = await import("@/lib/notify/twilio");
    return twilioConfigured() ? admin.toasts.nudged : admin.toasts.nudgeOff;
  });
}

export async function verifyAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(`/admin/${ref}`, async () => {
    const { allVerified } = await workflow.verifyDocument(ref, text(formData, "documentId"));
    return allVerified ? admin.toasts.verifiedAll : admin.toasts.verified;
  });
}

export async function reuploadAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const reason = admin.reupload.reasons.find((item) => item.value === text(formData, "reason"));
  if (!reason) return { ok: false, errors: { reason: admin.reupload.errors.reason } };
  return run(`/admin/${ref}`, async () => {
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
  return run(`/admin/${ref}`, async () => {
    const { withLevies } = await import("@/lib/data/quote-provider");
    const { totalKes, breakdown } = withLevies(Math.round(q.premium));
    await workflow.addQuote(ref, {
      insurer: q.insurer,
      coverType: q.coverType,
      premiumKes: totalKes,
      breakdown,
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
  return run(`/admin/${ref}`, async () => {
    await workflow.markQuotesReady(ref);
    return admin.toasts.quotesReady;
  });
}

export async function sendQuotesAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(back(formData, ref), async () => {
    await workflow.sendSuggestedQuotes(ref);
    return admin.toasts.quotesSent;
  });
}

export async function verifyAllAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(back(formData, ref), async () => {
    const { allVerified } = await workflow.verifyAllDocuments(ref);
    return allVerified ? admin.toasts.verifiedAll : admin.toasts.verified;
  });
}

export async function recordPaymentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run(`/admin/${ref}`, async () => {
    await workflow.recordPayment(ref, text(formData, "receipt").slice(0, 40));
    return admin.toasts.paymentRecorded;
  });
}

const issueSchema = z.object({
  policyNumber: z.string().trim().min(3, admin.issueForm.errors.policyNumber).max(60),
  certificateNumber: z.string().trim().max(60).optional().default(""),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, admin.issueForm.errors.startsOn),
});

export async function issueCoverAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  const parsed = issueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  return run(back(formData, ref), async () => {
    await workflow.issueCover(ref, parsed.data);
    return admin.toasts.covered;
  });
}

// Agents

export async function approveAgentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run("/admin/agents", async () => {
    await workflow.approveAgent(text(formData, "agentId"));
    return admin.toasts.agentApproved;
  });
}

export async function agentStatusAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const status = text(formData, "status") === "paused" ? "paused" : "active";
  return run("/admin/agents", async () => {
    await workflow.setAgentStatus(text(formData, "agentId"), status);
    return status === "paused" ? admin.toasts.agentPaused : admin.toasts.agentResumed;
  });
}

export async function agentRateAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const rate = Number(text(formData, "rate").replace(",", "."));
  return run("/admin/agents", async () => {
    await workflow.setAgentRate(text(formData, "agentId"), rate);
    return admin.toasts.rateSaved;
  });
}

export async function payAgentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return run("/admin/agents", async () => {
    const total = await workflow.payAgent(text(formData, "agentId"));
    return admin.toasts.agentPaid(formatKes(total));
  });
}

const codeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => /^[A-Z0-9]{3,12}$/.test(value), admin.agents.errors.code);

export async function addAgentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return denied;
  const name = text(formData, "name").trim();
  const phone = phoneSchema.safeParse(text(formData, "phone"));
  const email = emailSchema.safeParse(text(formData, "email"));
  const code = codeSchema.safeParse(text(formData, "code"));
  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = admin.agents.errors.name;
  if (!phone.success) errors.phone = admin.agents.errors.phone;
  if (!email.success) errors.email = admin.agents.errors.email;
  if (!code.success) errors.code = admin.agents.errors.code;
  if (!phone.success || !email.success || !code.success || errors.name) return { ok: false, errors };

  const repo = getRepo();
  if (await repo.findAgentByCode(code.data)) return { ok: false, errors: { code: admin.agents.errors.codeTaken } };
  if (await repo.findAgentByPhone(phone.data)) return { ok: false, errors: { phone: admin.agents.errors.phoneTaken } };
  const settings = await repo.getSettings();
  const agent = await repo.createAgent({
    name,
    phone: phone.data,
    email: email.data || undefined,
    code: code.data,
    commissionRate: settings.defaultCommissionRate,
    status: "pending",
  });
  return run("/admin/agents", async () => {
    await workflow.approveAgent(agent.id);
    return admin.toasts.agentAdded;
  });
}

// Automations

export async function saveSettingsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const on = (key: string) => formData.get(key) === "on";
  const rate = Number(text(formData, "defaultCommissionRate").replace(",", "."));
  if (!Number.isFinite(rate) || rate < 0 || rate > 20) return { ok: false, errors: { defaultCommissionRate: admin.agents.errors.rate } };
  return run("/admin/automations", async () => {
    await getRepo().updateSettings({
      autoQuote: on("autoQuote"),
      nudgeStalled: on("nudgeStalled"),
      remindQuotes: on("remindQuotes"),
      remindPayment: on("remindPayment"),
      renewalReminders: on("renewalReminders"),
      defaultCommissionRate: rate,
    });
    return admin.toasts.settingsSaved;
  });
}

/** Admin → Insurers: which insurers clients get quotes from. */
export async function savePanelAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { insurers } = await import("@/lib/data/insurers");
  const panel = insurers.filter((insurer) => formData.get(`panel_${insurer.id}`) === "on").map((insurer) => insurer.id);
  if (panel.length === 0) return { ok: false, errors: { _form: admin.insurers.errors.empty } };
  return run("/admin/insurers", async () => {
    await getRepo().updateSettings({ panel });
    return admin.toasts.panelSaved(panel.length);
  });
}

export async function runAutomationsAction(): Promise<ActionResult> {
  return run("/admin/automations", async () => {
    const results = await runAutomations();
    return admin.toasts.automationsRan(results.filter((result) => result.rule !== "renewals_digest").length);
  });
}

export async function remindRenewalAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = text(formData, "ref");
  return run("/admin/renewals", async () => {
    const repo = getRepo();
    const app = await repo.getApplication(ref);
    const client = app ? await repo.getClient(app.clientId) : null;
    if (!app?.policy || !client) throw new workflow.WorkflowError(admin.errors.notAllowed);
    const { daysLeft } = await import("@/lib/automation");
    await workflow.remindRenewal(app, client, Math.max(daysLeft(app.policy.endsAt), 1));
    return admin.toasts.renewalSent;
  });
}

// Demo and sign-in

/** Demo only (Stage 10): restore the sample data and clear the outbox. */
export async function resetDemoAction(): Promise<ActionResult> {
  if (!(await isAdmin())) return denied;
  await getRepo().reset();
  return { ok: true, next: "/admin", toast: admin.demo.toast };
}

/** "Send test WhatsApp" on the Messages page: sends to the agency number and reports Twilio's answer. */
export async function testWhatsAppAction(): Promise<ActionResult> {
  if (!(await isAdmin())) return denied;
  const { brand } = await import("@/lib/brand");
  const { sendWhatsAppDetailed } = await import("@/lib/notify/twilio");
  const r = admin.whatsappCheck.results;
  const result = await sendWhatsAppDetailed(`+${brand.contact.whatsappE164}`, admin.whatsappCheck.testMessage, true);
  if (result.ok) return { ok: true, next: "/admin/outbox", toast: r.sent(result.status) };
  const message = result.reason === "other" ? r.other(result.detail ?? "unknown error") : r[result.reason];
  return { ok: false, errors: { _form: message } };
}

export async function adminSignInAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ok = await signInAdmin(text(formData, "password"));
  if (!ok) return { ok: false, errors: { password: admin.errors.signIn } };
  return { ok: true, next: "/admin" };
}

export async function adminSignOutAction(): Promise<ActionResult> {
  await signOutAdmin();
  return { ok: true, next: "/admin/login" };
}
