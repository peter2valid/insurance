/**
 * Real WhatsApp sending through Twilio — demo only, via Twilio's WhatsApp
 * Sandbox. A number only receives messages after it has opted in by sending
 * the sandbox "join <code>" message. Production would need a Meta-approved
 * WhatsApp Business sender and message templates (CLAUDE.md §12).
 *
 * Env (server only): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 * TWILIO_WHATSAPP_FROM (e.g. "whatsapp:+14155238886"). Without them, every
 * message stays simulated. No SDK: plain REST calls with fetch.
 * Never logs bodies or numbers: personal data (CLAUDE.md §9).
 */

const ENV_NAMES = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_WHATSAPP_FROM"] as const;

/** Values trimmed — pasted keys often carry a stray space or newline. */
function config() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const rawFrom = process.env.TWILIO_WHATSAPP_FROM?.trim().replace(/\s+/g, "");
  const from = rawFrom ? (rawFrom.startsWith("whatsapp:") ? rawFrom : `whatsapp:${rawFrom}`) : undefined;
  return { sid, token, from };
}

export function twilioConfigured(): boolean {
  const { sid, token, from } = config();
  return Boolean(sid && token && from);
}

/** Which of the three variables the server can't see (names only, never values). */
export function missingTwilioVars(): string[] {
  return ENV_NAMES.filter((name) => !process.env[name]?.trim());
}

export type WhatsAppResult =
  | { ok: true; status: string }
  | {
      ok: false;
      reason:
        | "not_configured"
        | "auth"
        | "not_joined"
        | "window"
        | "template_only"
        | "bad_sender"
        | "bad_number"
        | "network"
        | "other";
      detail?: string;
    };

function reasonFor(
  code: number | undefined,
  httpStatus: number,
  message?: string,
): Exclude<WhatsAppResult, { ok: true }>["reason"] {
  if (httpStatus === 401 || code === 20003) return "auth";
  // This sender only accepts approved templates (no free-form messages).
  if (message && /contentsid/i.test(message)) return "template_only";
  if (code === 63015) return "not_joined"; // sandbox: recipient hasn't joined
  if (code === 63016) return "window"; // outside WhatsApp's 24-hour window: needs a template
  if (code === 63007 || code === 21606 || code === 21212) return "bad_sender";
  if (code === 21211 || code === 21614 || code === 63003) return "bad_number";
  return "other";
}

const authHeader = (sid: string, token: string) => `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;

/**
 * Send one WhatsApp. With `confirm`, wait briefly and ask Twilio whether it
 * actually went out — the sandbox reports "hasn't joined" a moment later,
 * not in the first reply. Used by the admin's "Send test WhatsApp".
 */
export async function sendWhatsAppDetailed(toE164: string, body: string, confirm = false): Promise<WhatsAppResult> {
  const { sid, token, from } = config();
  if (!sid || !token || !from) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: authHeader(sid, token), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: from, To: `whatsapp:${toE164}`, Body: body }),
      signal: AbortSignal.timeout(7000),
    });
    const data = (await response.json().catch(() => ({}))) as { sid?: string; status?: string; code?: number; message?: string };
    if (!response.ok) return { ok: false, reason: reasonFor(data.code, response.status, data.message), detail: data.message };
    if (!confirm || !data.sid) return { ok: true, status: data.status ?? "queued" };

    // Check the outcome once it has had a moment to go through.
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const check = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages/${data.sid}.json`, {
        headers: { Authorization: authHeader(sid, token) },
        signal: AbortSignal.timeout(5000),
      });
      const latest = (await check.json().catch(() => ({}))) as { status?: string; error_code?: number | null; error_message?: string | null };
      if (latest.status === "failed" || latest.status === "undelivered") {
        return {
          ok: false,
          reason: reasonFor(latest.error_code ?? undefined, 200, latest.error_message ?? undefined),
          detail: latest.error_message ?? undefined,
        };
      }
      if (latest.status === "sent" || latest.status === "delivered" || latest.status === "read") {
        return { ok: true, status: latest.status };
      }
    }
    return { ok: true, status: "queued" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** Fire-and-report version used for everyday messages. */
export async function sendWhatsApp(toE164: string, body: string): Promise<boolean> {
  return (await sendWhatsAppDetailed(toE164, body)).ok;
}
