/**
 * Kenyan mobile numbers. Accepts "0712345678", "712345678",
 * "+254712345678" or "254 712 345 678" and returns "+254712345678",
 * or null if it is not a valid mobile number (07xx / 01xx).
 */
export function normalizeKenyanPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const national = digits.startsWith("254")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
  return /^[71]\d{8}$/.test(national) ? `+254${national}` : null;
}

/** "+254712345678" -> "+254 712 345 678" for display. */
export function formatKenyanPhone(e164: string): string {
  const national = e164.replace(/^\+254/, "");
  return `+254 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`.trim();
}
