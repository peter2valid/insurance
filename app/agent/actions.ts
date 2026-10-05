"use server";

import { tellAdmin } from "@/lib/admin/workflow";
import { agent as copy } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";
import type { ActionResult } from "@/lib/flow/action-result";
import { emailSchema, phoneSchema } from "@/lib/flow/validation";
import { formatKenyanPhone } from "@/lib/format/phone";
import { getNotifier } from "@/lib/notify";
import {
  checkCode,
  clearPendingCode,
  endAgentSession,
  getPendingCode,
  setPendingCode,
  startAgentSession,
} from "@/lib/session";

/** Agent sign-in and sign-up. Phone + code, SIMULATED like the client's (code 123456). */

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

export async function agentSendCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const phone = phoneSchema.safeParse(text(formData, "phone"));
  if (!phone.success) return { ok: false, errors: { phone: copy.login.errors.phone } };
  const found = await getRepo().findAgentByPhone(phone.data);
  if (!found) return { ok: false, errors: { phone: copy.login.errors.unknown } };
  await setPendingCode(phone.data);
  await getNotifier().send({ channel: "sms", to: phone.data, audience: "agent", template: "login_code", data: { code: "123456" } });
  return { ok: true, next: "/agent/login?step=code", toast: copy.login.sentToast };
}

export async function agentVerifyCode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const pending = await getPendingCode();
  if (!pending) return { ok: true, next: "/agent/login" };
  const result = checkCode(text(formData, "code").trim(), pending);
  if (result === "expired") return { ok: false, errors: { code: copy.login.errors.expired } };
  if (result === "wrong") return { ok: false, errors: { code: copy.login.errors.code } };
  const found = await getRepo().findAgentByPhone(pending.phone);
  if (!found) return { ok: false, errors: { code: copy.login.errors.unknown } };
  await startAgentSession(found.id);
  await clearPendingCode();
  return { ok: true, next: "/agent" };
}

/** Generate a short, unique referral code from the name, e.g. "JANE" or "JANE2". */
async function uniqueCode(name: string): Promise<string> {
  const base = (name.split(/\s+/)[0] ?? "AGENT").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "AGENT";
  const repo = getRepo();
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}${n + 1}`;
    if (!(await repo.findAgentByCode(candidate))) return candidate;
  }
  return `${base}${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export async function agentJoin(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const name = text(formData, "name").trim().replace(/\s+/g, " ");
  const phone = phoneSchema.safeParse(text(formData, "phone"));
  const email = emailSchema.safeParse(text(formData, "email"));
  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = copy.join.errors.name;
  if (!phone.success) errors.phone = copy.join.errors.phone;
  if (!email.success) errors.email = copy.join.errors.email;
  if (!phone.success || !email.success || errors.name) return { ok: false, errors };

  const repo = getRepo();
  if (await repo.findAgentByPhone(phone.data)) return { ok: false, errors: { phone: copy.join.errors.exists } };
  const settings = await repo.getSettings();
  await repo.createAgent({
    name,
    phone: phone.data,
    email: email.data || undefined,
    code: await uniqueCode(name),
    commissionRate: settings.defaultCommissionRate,
    status: "pending",
  });
  await tellAdmin("agent_applied_admin", { name, phone: formatKenyanPhone(phone.data) });
  return { ok: true, next: "/agent/join?sent=1" };
}

export async function agentSignOut(): Promise<ActionResult> {
  await endAgentSession();
  return { ok: true, next: "/agent/login" };
}
