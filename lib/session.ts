import { cookies } from "next/headers";
import { isProduct, type Product } from "@/lib/data/types";

/**
 * SIMULATED phone sign-in (CLAUDE.md §8.1 step 2). The code is always
 * 123456. The session cookie holds the client id unsigned — fine for a
 * demo, NOT for production. Supabase phone auth replaces this file.
 *
 * Server-only: use from Server Components, Server Actions, Route Handlers.
 */

export const DEMO_CODE = "123456";
export const CODE_TTL_MS = 10 * 60 * 1000;

const SESSION_COOKIE = "bc_session";
const OTP_COOKIE = "bc_otp";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function getSessionClientId(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function startSession(clientId: string): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, clientId, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

type PendingCode = { phone: string; sentAt: number; product?: Product };

export async function setPendingCode(phone: string, product?: Product): Promise<void> {
  const value: PendingCode = { phone, sentAt: Date.now(), product };
  (await cookies()).set(OTP_COOKIE, JSON.stringify(value), { ...cookieOptions, maxAge: 60 * 30 });
}

export async function getPendingCode(): Promise<PendingCode | null> {
  const raw = (await cookies()).get(OTP_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingCode;
    if (typeof parsed.phone !== "string" || typeof parsed.sentAt !== "number") return null;
    return { phone: parsed.phone, sentAt: parsed.sentAt, product: isProduct(parsed.product) ? parsed.product : undefined };
  } catch {
    return null;
  }
}

export async function clearPendingCode(): Promise<void> {
  (await cookies()).delete(OTP_COOKIE);
}

export type CodeCheck = "ok" | "wrong" | "expired";

export function checkCode(code: string, pending: PendingCode, now: number = Date.now()): CodeCheck {
  if (now - pending.sentAt > CODE_TTL_MS) return "expired";
  return code === DEMO_CODE ? "ok" : "wrong";
}

// ---------------------------------------------------------------------------
// Agents: same SIMULATED phone + code sign-in, separate cookie.
// ---------------------------------------------------------------------------

const AGENT_COOKIE = "bc_agent_session";
const REFERRAL_COOKIE = "bc_ref";

export async function getSessionAgentId(): Promise<string | null> {
  return (await cookies()).get(AGENT_COOKIE)?.value ?? null;
}

export async function startAgentSession(agentId: string): Promise<void> {
  (await cookies()).set(AGENT_COOKIE, agentId, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
}

export async function endAgentSession(): Promise<void> {
  (await cookies()).delete(AGENT_COOKIE);
}

/** Referral: the agent code from a /r/CODE link, remembered for 60 days. */
export async function setReferral(code: string): Promise<void> {
  (await cookies()).set(REFERRAL_COOKIE, code.toUpperCase(), { ...cookieOptions, maxAge: 60 * 60 * 24 * 60 });
}

export async function getReferral(): Promise<string | null> {
  return (await cookies()).get(REFERRAL_COOKIE)?.value ?? null;
}

// ---------------------------------------------------------------------------
// Admin: optional password gate. When ADMIN_PASSWORD is set, /admin asks
// for it; when it isn't (local demo), admin stays open. The cookie holds a
// hash of the password, so changing the password signs everyone out.
// ---------------------------------------------------------------------------

const ADMIN_COOKIE = "bc_admin";

export function adminPasswordSet(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

async function adminToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`beacon-admin:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex");
}

export async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return true;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return value === (await adminToken(password));
}

/** Returns false when the password is wrong. */
export async function signInAdmin(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected || password !== expected) return false;
  (await cookies()).set(ADMIN_COOKIE, await adminToken(expected), { ...cookieOptions, maxAge: 60 * 60 * 24 * 14 });
  return true;
}

export async function signOutAdmin(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
