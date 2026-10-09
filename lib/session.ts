import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isProduct, type Product } from "@/lib/data/types";

/**
 * Client sign-in without a code (Oct 2026, owner's decision).
 *
 * - Typing a phone number signs this DEVICE in as that client and lets it
 *   start applications. An application opens only on the device that
 *   started it, or after a signed link from one of our messages (/go/…).
 *   So typing someone else's number never shows their ID, logbook or policy.
 * - The cookie is signed (HMAC) so it can't be edited by hand.
 * - Agents still sign in with the SIMULATED code below (123456).
 *
 * Still a demo-grade session: Supabase auth replaces this file later.
 * Server-only: use from Server Components, Server Actions, Route Handlers.
 */

export const DEMO_CODE = "123456";
export const CODE_TTL_MS = 10 * 60 * 1000;

const SESSION_COOKIE = "bc_session";
const OTP_COOKIE = "bc_otp";
const SESSION_DAYS = 90;
/** Applications opened from links, remembered per device (newest kept). */
const MAX_GRANTED = 20;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Signing key: SESSION_SECRET, else derived from another server secret, else a dev-only value. */
function secret(): string {
  return (
    process.env.SESSION_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "beacon-dev-only-secret"
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function verify(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type ClientSession = {
  /** Client id. */
  c: string;
  /** This device's id: applications started here carry it (details.deviceId). */
  d: string;
  /** Refs this device may open because it followed a signed link. */
  r: string[];
};

export async function getSession(): Promise<ClientSession | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verify(payload, signature)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ClientSession;
    if (typeof parsed.c !== "string" || typeof parsed.d !== "string" || !Array.isArray(parsed.r)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionClientId(): Promise<string | null> {
  return (await getSession())?.c ?? null;
}

async function writeSession(session: ClientSession): Promise<void> {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, { ...cookieOptions, maxAge: 60 * 60 * 24 * SESSION_DAYS });
}

/**
 * Sign this device in as a client. Same client again: keep the device id and
 * opened links. A different client: a fresh start (nothing carried over).
 */
export async function startSession(clientId: string, grantRef?: string): Promise<ClientSession> {
  const current = await getSession();
  const same = current?.c === clientId;
  const session: ClientSession = {
    c: clientId,
    d: same && current ? current.d : randomUUID(),
    r: same && current ? current.r : [],
  };
  if (grantRef && !session.r.includes(grantRef)) session.r = [grantRef, ...session.r].slice(0, MAX_GRANTED);
  await writeSession(session);
  return session;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** May this device open this application? (Started here, or opened from our link.) */
export function canAccess(session: ClientSession, app: { ref: string; clientId: string; details: Record<string, string> }): boolean {
  if (app.clientId !== session.c) return false;
  return app.details.deviceId === session.d || session.r.includes(app.ref);
}

/** The signature in our message links: /go/<ref>?k=<token>. */
export function linkToken(ref: string): string {
  return sign(`link:${ref}`).slice(0, 24);
}

export function checkLinkToken(ref: string, token: string): boolean {
  const expected = Buffer.from(linkToken(ref));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
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

/**
 * The quote a signed-out client chose (answers + insurer), carried through
 * sign-in. Only answers: prices are always worked out again on the server.
 */
const QUOTE_COOKIE = "bc_quote";

export async function setPendingQuote(details: Record<string, string>): Promise<void> {
  (await cookies()).set(QUOTE_COOKIE, JSON.stringify(details), { ...cookieOptions, maxAge: 60 * 60 * 24 });
}

export async function getPendingQuote(): Promise<Record<string, string> | null> {
  const raw = (await cookies()).get(QUOTE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  } catch {
    return null;
  }
}

export async function clearPendingQuote(): Promise<void> {
  (await cookies()).delete(QUOTE_COOKIE);
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
