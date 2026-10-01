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
