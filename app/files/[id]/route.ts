import { getRepo } from "@/lib/data/repo";
import { canAccess, getSession, isAdmin } from "@/lib/session";

/**
 * Uploaded documents (logbooks, IDs, KRA PINs). Only the broker (admin) or
 * the client whose application holds the file may open it — on the phone
 * that started the application or after following our signed link.
 * Anyone else gets "not found", so the address alone reveals nothing.
 */
export async function GET(_request: Request, context: RouteContext<"/files/[id]">) {
  const { id } = await context.params;
  if (!(await isAdmin()) && !(await clientMayView(id))) return new Response("Not found", { status: 404 });

  const file = await getRepo().getFile(id);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Blob([file.bytes as BlobPart], { type: file.type }), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function clientMayView(id: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const url = `/files/${id}`;
  const apps = await getRepo().listApplicationsForClient(session.c);
  return apps.some((app) => canAccess(session, app) && app.documents.some((doc) => doc.fileUrl === url));
}
