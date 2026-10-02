import { currentVersion } from "@/lib/events";

/**
 * Tiny "has anything changed?" endpoint that open pages poll for live sync.
 * Returns only a number — never any personal data.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  // Only well-formed references (e.g. BC-4821) are accepted.
  const safeRef = ref && /^[A-Z]{2}-\d{1,8}$/.test(ref) ? ref : null;
  const v = await currentVersion(safeRef);
  return Response.json({ v }, { headers: { "Cache-Control": "no-store" } });
}
