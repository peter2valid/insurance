import { getRepo } from "@/lib/data/repo";

/**
 * The home page hero background — public, but only the image currently
 * chosen in Admin → Website (never any other uploaded file). A new upload
 * gets a new id, so the address changes and caches can keep it for a year.
 */
export async function GET(_request: Request, context: RouteContext<"/hero-image/[id]">) {
  const { id } = await context.params;
  const repo = getRepo();
  const { heroImageId } = await repo.getSettings();
  if (!heroImageId || id !== heroImageId) return new Response("Not found", { status: 404 });
  const file = await repo.getFile(id);
  if (!file || !file.type.startsWith("image/")) return new Response("Not found", { status: 404 });

  return new Response(new Blob([file.bytes as BlobPart], { type: file.type }), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
