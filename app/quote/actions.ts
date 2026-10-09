"use server";

import { quote } from "@/lib/copy";
import { insurerByName } from "@/lib/data/insurers";
import { coversVehicle } from "@/lib/data/quote-provider";
import { getRepo } from "@/lib/data/repo";
import type { ActionResult } from "@/lib/flow/action-result";
import { applyQuote, getFlowContext } from "@/lib/flow/context";
import { parseMotorQuote, quoteKeys, quoteResultsHref } from "@/lib/flow/motor-quote";
import { screenHref } from "@/lib/flow/screens";
import { getSessionClientId, setPendingQuote } from "@/lib/session";

/**
 * Instant motor quote. Nothing is stored until the client chooses an
 * insurer; the answers travel in the results page's address.
 */

function answers(formData: FormData): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const key of quoteKeys) {
    // Add-ons arrive as one value per ticked box.
    raw[key] = formData.getAll(key).map(String).join(",");
  }
  return raw;
}

/** "Show my quotes": check the answers, then open the comparison. */
export async function getMotorQuotes(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = parseMotorQuote(answers(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  return { ok: true, next: quoteResultsHref(parsed.details) };
}

/**
 * "Choose Britam": keep the choice. Signed in already — straight into the
 * application. Otherwise remember it and ask for the phone number.
 */
export async function chooseInsurer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const raw = answers(formData);
  const parsed = parseMotorQuote(raw, { staleStartIsToday: true });
  const insurerName = String(formData.get("insurer") ?? "");
  const insurer = insurerByName(insurerName);
  const { panel } = await getRepo().getSettings();
  if (!parsed.ok || !insurer || !panel.includes(insurer.id) || !coversVehicle(insurer, parsed.details)) {
    return { ok: false, errors: { _form: quote.compare.errors.expired } };
  }
  const chosen = { ...parsed.details, insurer: insurer.name };
  const toast = quote.compare.chosenToast(insurer.name);

  const clientId = await getSessionClientId();
  const client = clientId ? await getRepo().getClient(clientId) : null;
  if (client) {
    const app = await applyQuote(client.id, chosen);
    const ctx = app ? await getFlowContext(app.ref) : null;
    if (ctx?.kind === "active") return { ok: true, next: screenHref(ctx.resume, ctx.app.ref), toast };
    return { ok: false, errors: { _form: quote.compare.errors.expired } };
  }

  await setPendingQuote(chosen);
  return { ok: true, next: "/start/phone?product=motor", toast };
}

