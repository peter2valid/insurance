import { brand } from "@/lib/brand";

/**
 * Real email through Resend (https://resend.com) — plain REST, no SDK.
 * Env (server only): RESEND_API_KEY, EMAIL_FROM (e.g. "Beacon Cover
 * <hello@yourdomain.co.ke>", a domain verified in Resend). Without them
 * every email stays simulated in the Outbox.
 * Never logs addresses or bodies: personal data (CLAUDE.md §9).
 */

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export function missingEmailVars(): string[] {
  return ["RESEND_API_KEY", "EMAIL_FROM"].filter((name) => !process.env[name]?.trim());
}

/** Where admin emails go. */
export function adminEmail(): string | undefined {
  return process.env.ADMIN_EMAIL?.trim() || undefined;
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Turn a plain message into a simple branded email. A line that is just a
 * link becomes a button; the line before it is its label.
 */
export function renderEmailHtml(body: string): string {
  const lines = body.split("\n");
  const parts: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const next = lines[i + 1]?.trim() ?? "";
    if (/^https?:\/\/\S+$/.test(next) && line.endsWith(":")) {
      parts.push(
        `<p style="margin:24px 0"><a href="${escape(next)}" style="background:#175C54;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${escape(line.slice(0, -1))}</a></p>`,
      );
      i++;
      continue;
    }
    if (/^https?:\/\/\S+$/.test(line)) {
      parts.push(`<p><a href="${escape(line)}" style="color:#175C54">${escape(line)}</a></p>`);
      continue;
    }
    parts.push(`<p style="margin:0 0 12px">${escape(line)}</p>`);
  }
  return `<!doctype html><html><body style="margin:0;background:#F5F6F3;font-family:Arial,Helvetica,sans-serif;color:#16241F">
<div style="max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:18px;font-weight:700;color:#175C54;margin:0 0 16px">${escape(brand.name)}</p>
<div style="background:#ffffff;border:1px solid #DCE3DD;border-radius:14px;padding:24px;font-size:16px;line-height:1.5">${parts.join("")}</div>
<p style="font-size:12px;color:#52645C;margin-top:16px">${escape(brand.name)} · ${escape(brand.contact.phoneDisplay)}</p>
</div></body></html>`;
}

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: body, html: renderEmailHtml(body) }),
      signal: AbortSignal.timeout(7000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
