import { brand } from "@/lib/brand";
import { linkToken } from "@/lib/session";

/**
 * Links we send clients on WhatsApp and email. Each carries a signature for
 * its application, so opening it signs the client in on that phone — no
 * code — and only for that application (app/go/[ref]/route.ts).
 * Server-only.
 */
export function clientLink(ref: string, path: string = `/my/${ref}`): string {
  const to = path === `/my/${ref}` ? "" : `&to=${encodeURIComponent(path)}`;
  return `${brand.siteUrl}/go/${encodeURIComponent(ref)}?k=${linkToken(ref)}${to}`;
}

/** Where a link may send someone: our own client pages only. */
export function safeTarget(path: string | null, ref: string): string {
  if (path && /^\/(my|start)\//.test(path) && !path.startsWith("//")) return path;
  return `/my/${ref}`;
}
