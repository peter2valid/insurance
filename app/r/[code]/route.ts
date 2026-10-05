import { NextResponse } from "next/server";
import { getRepo } from "@/lib/data/repo";
import { setReferral } from "@/lib/session";

/**
 * An agent's referral link: /r/JANE. Remembers the agent (60 days) so the
 * client's next application credits them, then opens the home page.
 */
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const agent = await getRepo().findAgentByCode(code);
  if (agent && agent.status === "active") await setReferral(agent.code);
  return NextResponse.redirect(new URL(agent ? `/?agent=${encodeURIComponent(agent.code)}` : "/", request.url));
}
