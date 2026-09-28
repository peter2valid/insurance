import { brand } from "@/lib/brand";

/**
 * wa.me link that opens WhatsApp with a pre-filled message.
 * Uses the placeholder number in lib/brand.ts until the real one arrives.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${brand.contact.whatsappE164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

