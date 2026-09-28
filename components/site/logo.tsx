import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { brand } from "@/lib/brand";
import { site } from "@/lib/copy";

/**
 * Placeholder wordmark. Swap for the agency's logo file when it arrives
 * (keep the link and the accessible name).
 */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label={site.header.homeLabel}
      className="inline-flex min-h-touch items-center gap-2 rounded-control text-ink"
    >
      <ShieldCheck className="size-6 text-brand" aria-hidden />
      <span className="font-heading text-lg font-semibold whitespace-nowrap">{brand.name}</span>
    </Link>
  );
}
