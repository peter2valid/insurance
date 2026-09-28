import { getRepo } from "@/lib/data/repo";

/**
 * SIMULATED file serving for uploaded documents. No access check yet —
 * demo only. With Supabase, documents come from a private bucket via
 * short-lived signed URLs instead.
 */
export async function GET(_request: Request, context: RouteContext<"/files/[id]">) {
  const { id } = await context.params;
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
