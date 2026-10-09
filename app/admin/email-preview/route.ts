import { brand } from "@/lib/brand";
import { notifySubjects, notifyTemplates } from "@/lib/copy";
import { renderEmailHtml } from "@/lib/notify/email";
import { isAdmin } from "@/lib/session";

/** Admin only: the email a client gets when their quotes are ready, with sample details. */
export async function GET() {
  if (!(await isAdmin())) return new Response("Not found", { status: 404 });
  const body = notifyTemplates.status_changed({
    firstName: "Wanjiku",
    ref: "BC-4821",
    detail: "your quotes are ready. Compare the insurers and choose your cover — it takes a minute.",
    linkLabel: "Compare your quotes",
    link: `${brand.siteUrl}/my/BC-4821#quotes`,
  });
  const html = renderEmailHtml(notifySubjects.status_changed ?? brand.name, body);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
