/**
 * Real WhatsApp sending through Twilio — demo only, via Twilio's WhatsApp
 * Sandbox. A number only receives messages after it has opted in by sending
 * the sandbox "join <code>" message. Production would need a Meta-approved
 * WhatsApp Business sender and message templates (CLAUDE.md §12).
 *
 * Env (server only): TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
 * TWILIO_WHATSAPP_FROM (e.g. "whatsapp:+14155238886"). Without them, every
 * message stays simulated. No SDK: one REST call with fetch.
 */

export function twilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
}

export async function sendWhatsApp(toE164: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) return false;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
        To: `whatsapp:${toE164}`,
        Body: body,
      }),
      signal: AbortSignal.timeout(8000),
    });
    // Never log the body or number: personal data (CLAUDE.md §9).
    return response.ok;
  } catch {
    return false;
  }
}
