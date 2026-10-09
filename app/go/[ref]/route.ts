import { NextResponse, type NextRequest } from "next/server";
import { getRepo } from "@/lib/data/repo";
import { safeTarget } from "@/lib/flow/links";
import { checkLinkToken, startSession } from "@/lib/session";

/**
 * A link from one of our messages: check its signature, sign this device in
 * as the application's client (for that application only), and open it.
 * A wrong or old link just opens the page, which asks them to sign in.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const url = request.nextUrl;
  const target = new URL(safeTarget(url.searchParams.get("to"), ref), url.origin);

  const token = url.searchParams.get("k") ?? "";
  if (token && checkLinkToken(ref, token)) {
    const app = await getRepo().getApplication(ref);
    if (app) await startSession(app.clientId, app.ref);
  }
  return NextResponse.redirect(target);
}

export const dynamic = "force-dynamic";
