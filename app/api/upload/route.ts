import { getRepo } from "@/lib/data/repo";
import type { DocumentType } from "@/lib/data/types";
import { ExtractionError, extractLogbook, MAX_LOGBOOK_BYTES } from "@/lib/extract";
import { getFlowContext, saveAndAdvance } from "@/lib/flow/context";
import { screenHref } from "@/lib/flow/screens";

/**
 * Document upload for the client flow. A route handler (not a server
 * action) so the browser can report real upload progress.
 *
 * Responses: { ok: true, next } or { ok: false, code } where `code` maps to
 * a plain-language message in lib/copy/flow.
 */

const ALLOWED_KINDS: DocumentType[] = ["logbook", "national_id"];

function isAllowedType(type: string) {
  return type.startsWith("image/") || type === "application/pdf";
}

const fail = (code: string, status = 400) => Response.json({ ok: false, code }, { status });

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("upload");
  }

  const file = form.get("file");
  const kind = form.get("kind");
  const ref = form.get("ref");
  if (!(file instanceof File) || typeof kind !== "string" || !ALLOWED_KINDS.includes(kind as DocumentType)) {
    return fail("upload");
  }
  if (!isAllowedType(file.type)) return fail("unsupported_file");
  if (file.size > MAX_LOGBOOK_BYTES) return fail("too_large");

  const ctx = await getFlowContext(typeof ref === "string" ? ref : null);
  if (ctx.kind !== "active") return fail("not_allowed", 403);

  const repo = getRepo();
  const details: Record<string, string> = {};

  // Read the logbook before storing it, so an unreadable photo isn't kept.
  if (kind === "logbook") {
    try {
      const { fields, confidence } = await extractLogbook(file);
      const typedPlate = ctx.app.details.plate;
      Object.assign(details, fields, {
        // The client's own typed plate wins over what was read.
        plate: typedPlate || fields.plate,
        lowConfidence: Object.entries(confidence)
          .filter(([, level]) => level === "low")
          .map(([field]) => field)
          .join(","),
        vehicleConfirmed: "",
        logbookLater: "",
      });
    } catch (error) {
      if (error instanceof ExtractionError) return fail(error.code, 422);
      return fail("upload", 500);
    }
  } else {
    details.idLater = "";
  }

  const stored = await repo.saveFile({
    name: file.name,
    type: file.type,
    bytes: new Uint8Array(await file.arrayBuffer()),
  });
  const doc = ctx.app.documents.find((item) => item.type === kind);
  if (!doc) return fail("upload", 500);

  const app = await repo.updateDocument(ctx.app.ref, doc.id, {
    status: "uploaded",
    fileName: file.name,
    fileUrl: stored.url,
    uploadedAt: new Date().toISOString(),
  });
  const { next } = await saveAndAdvance(app, ctx.client, details);
  return Response.json({ ok: true, next: screenHref(next, app.ref) });
}
