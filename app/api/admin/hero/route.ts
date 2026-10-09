import { NextResponse } from "next/server";
import { getRepo } from "@/lib/data/repo";
import { isAdmin } from "@/lib/session";

/**
 * Admin → Website: upload (POST) or remove (DELETE) the home page hero
 * background. The browser shrinks the photo first (lib/images/compress.ts).
 */
const MAX_BYTES = 4 * 1024 * 1024;
const fail = (code: string, status = 400) => NextResponse.json({ ok: false, code }, { status });

export async function POST(request: Request) {
  if (!(await isAdmin())) return fail("not_allowed", 403);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("upload");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail("upload");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return fail("unsupported_file");
  if (file.size > MAX_BYTES) return fail("too_large");

  const repo = getRepo();
  const stored = await repo.saveFile({ name: file.name, type: file.type, bytes: new Uint8Array(await file.arrayBuffer()) });
  await repo.updateSettings({ heroImageId: stored.id });
  return NextResponse.json({ ok: true, id: stored.id });
}

export async function DELETE() {
  if (!(await isAdmin())) return fail("not_allowed", 403);
  await getRepo().updateSettings({ heroImageId: "" });
  return NextResponse.json({ ok: true });
}
