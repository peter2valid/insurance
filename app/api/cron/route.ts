import { NextResponse } from "next/server";
import { runAutomations } from "@/lib/automation";

/**
 * Runs the automations (reminders, nudges, renewals). Called on a schedule by the
 * Netlify scheduled function (netlify/functions/automations.mjs, hourly) or Vercel
 * cron (vercel.json, daily: the Hobby plan limit). Protected by CRON_SECRET: send it as
 * "Authorization: Bearer <secret>". Without CRON_SECRET set, it refuses.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  }
  const results = await runAutomations();
  // Counts only — never personal data in responses or logs.
  return NextResponse.json({ ok: true, ran: results.length, rules: results.map((result) => result.rule) });
}

export const dynamic = "force-dynamic";
