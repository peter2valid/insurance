"use server";

import { statusPage } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";
import type { ActionResult } from "@/lib/flow/action-result";
import { getFlowContext } from "@/lib/flow/context";
import { formatKes } from "@/lib/format/money";
import { getNotifier } from "@/lib/notify";

/** Client picks one of the quotes on their status page. */
export async function chooseCover(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ref = formData.get("ref");
  const quoteId = formData.get("quoteId");
  if (typeof ref !== "string" || typeof quoteId !== "string") {
    return { ok: false, errors: { _form: statusPage.quotes.errors.notReady } };
  }

  const ctx = await getFlowContext(ref);
  if (ctx.kind !== "submitted" || ctx.app.status !== "quotes_ready") {
    return { ok: false, errors: { _form: statusPage.quotes.errors.notReady } };
  }

  const quote = await getRepo().chooseQuote(ref, quoteId);
  await getNotifier().send({
    channel: "whatsapp",
    to: "admin",
    audience: "admin",
    template: "cover_chosen",
    data: {
      ref,
      clientName: ctx.client.name,
      insurer: quote.insurer,
      premium: formatKes(quote.premiumKes),
    },
    applicationRef: ref,
  });

  return { ok: true, next: `/my/${ref}`, toast: statusPage.quotes.chosenToast };
}
