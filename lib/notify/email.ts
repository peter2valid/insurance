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

/*
 * Email colours: inbox apps don't understand CSS variables, so the brand
 * tokens (lib/tokens/tokens.css, light theme) are repeated here as values.
 */
const C = {
  bg: "#F5F6F3",
  surface: "#FFFFFF",
  ink: "#16241F",
  quiet: "#52645C",
  brand: "#175C54",
  brandDark: "#0F423C",
  border: "#DCE3DD",
  alt: "#EDF1EE",
};

const FONT = "'IBM Plex Sans',Segoe UI,Roboto,Helvetica,Arial,sans-serif";
const URL_LINE = /^https?:\/\/\S+$/;
const REF = /\b[A-Z]{2}-\d{4,}\b/;

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px"><tr><td style="background:${C.brand};border-radius:8px">
<a href="${escape(href)}" style="display:inline-block;padding:14px 24px;font:600 16px ${FONT};color:#FFFFFF;text-decoration:none">${escape(label)} &rarr;</a>
</td></tr></table>`;
}

/**
 * A polished, mobile-friendly email from a plain message: green header with
 * the agency name, the subject as a heading, the message, a big button for
 * the link (the line before a link, ending in ":", is its label), the
 * application reference, a WhatsApp help line and a footer. Table layout
 * so it looks right in Gmail, Outlook and phone mail apps.
 */
export function renderEmailHtml(
  subject: string,
  body: string,
  { audience = "client" }: { audience?: "client" | "admin" | "agent" } = {},
): string {
  const lines = body.split("\n");
  const parts: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // The WhatsApp sign-off ("Questions? Just reply…") — the email footer says it better.
    if (!line || /^Questions\?/.test(line)) continue;
    const next = lines[i + 1]?.trim() ?? "";
    if (URL_LINE.test(next) && line.endsWith(":")) {
      parts.push(button(line.slice(0, -1), next));
      i++;
      continue;
    }
    if (URL_LINE.test(line)) {
      parts.push(button(audience === "admin" ? "Open in admin" : "Open my application", line));
      continue;
    }
    parts.push(`<p style="margin:0 0 14px;font:16px/1.6 ${FONT};color:${C.ink}">${escape(line)}</p>`);
  }

  const ref = body.match(REF)?.[0];
  const preheader = lines.find((line) => line.trim() && !URL_LINE.test(line.trim()))?.trim() ?? subject;
  const help = `https://wa.me/${brand.contact.whatsappE164}?text=${encodeURIComponent(ref ? `Hello, about ${ref}: ` : "Hello, ")}`;
  const footerNote =
    audience === "admin"
      ? "You get this because you run this website. Change alerts in Admin → Automations."
      : `You get this because you applied for cover with ${brand.name}.`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="background:${C.brand};border-radius:14px 14px 0 0;padding:20px 28px">
    <span style="font:700 20px ${FONT};color:#FFFFFF;letter-spacing:.2px">&#9737; ${escape(brand.name)}</span>
  </td></tr>
  <tr><td style="background:${C.surface};border:1px solid ${C.border};border-top:0;border-radius:0 0 14px 14px;padding:28px">
    <h1 style="margin:0 0 18px;font:600 24px/1.3 Georgia,'IBM Plex Serif',serif;color:${C.ink}">${escape(subject)}</h1>
    ${parts.join("\n    ")}
    ${ref ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td style="background:${C.alt};border-radius:999px;padding:6px 14px;font:600 13px ${FONT};color:${C.brandDark}">Reference ${escape(ref)}</td></tr></table>` : ""}
    ${audience === "admin" ? "" : `<p style="margin:24px 0 0;padding-top:18px;border-top:1px solid ${C.border};font:14px/1.5 ${FONT};color:${C.quiet}">Questions? Reply to this email, <a href="${escape(help)}" style="color:${C.brand};font-weight:600">message us on WhatsApp</a> or call ${escape(brand.contact.phoneDisplay)}.</p>`}
  </td></tr>
  <tr><td style="padding:18px 8px;font:12px/1.5 ${FONT};color:${C.quiet};text-align:center">
    ${escape(brand.name)} &middot; ${escape(brand.contact.phoneDisplay)}<br>${escape(footerNote)}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  options: { audience?: "client" | "admin" | "agent" } = {},
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: body,
        html: renderEmailHtml(subject, body, options),
        // Replies go to the agency's inbox, not a no-reply address.
        ...(adminEmail() && { reply_to: adminEmail() }),
      }),
      signal: AbortSignal.timeout(7000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
