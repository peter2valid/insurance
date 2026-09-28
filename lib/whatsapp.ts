import { brand } from "@/lib/brand";

/**
 * wa.me link that opens WhatsApp with a pre-filled message.
 * Uses the placeholder number in lib/brand.ts until the real one arrives.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${brand.contact.whatsappE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** wa.me link to a specific number (E.164, e.g. "+254712345678"). Opens the broker's own WhatsApp. */
export function whatsappUrlTo(e164: string, message?: string): string {
  const base = `https://wa.me/${e164.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
