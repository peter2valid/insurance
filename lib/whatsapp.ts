import { brand } from "@/lib/brand";

/**
 * wa.me link that opens WhatsApp with a pre-filled message.
 * Uses the placeholder number in lib/brand.ts until the real one arrives.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${brand.contact.whatsappE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}


/** wa.me link to a client's number (E.164), with the message ready to send. */
export function whatsappUrlTo(e164: string, message?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Seeded sample clients and agents use the fake ranges +254 700 000 1xx / 2xx. Those numbers
 * might belong to real people, so we never open WhatsApp to them — their
 * messages stay simulated in the Outbox. Real applicants get a real link.
 */
export function isSampleNumber(e164: string): boolean {
  return /^\+254700000[12]\d{2}$/.test(e164);
}
