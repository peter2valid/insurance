import { brand } from "@/lib/brand";
import * as workflow from "@/lib/admin/workflow";
import { getRepo } from "@/lib/data/repo";
import type { Application, Client } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";

/**
 * Automations: the follow-ups a broker would otherwise do by hand.
 * Each rule runs at most once per key (repo.claimAutomation), so running
 * them often is safe. Triggered by:
 *  - /api/cron (Netlify scheduled function or Vercel cron, hourly), and
 *  - admin page views, at most every 10 minutes (so the demo works with
 *    no scheduler set up), and the "Run automations now" button.
 * Every message goes through the notifier: simulated unless WhatsApp or
 * email providers are configured, and always shown in the Outbox.
 */

export type AutomationRule = "nudge_stalled" | "remind_quotes" | "remind_payment" | "renewal" | "renewals_digest";

export type AutomationResult = { rule: AutomationRule; ref?: string; detail: string };

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
/** Days before the end date when renewal reminders go out. */
export const RENEWAL_DAYS = [30, 14, 7, 1] as const;

const age = (iso: string, now: number) => now - Date.parse(iso);
export const daysLeft = (endsAt: string, now: number = Date.now()) => Math.ceil((Date.parse(endsAt) - now) / DAY);

export async function runAutomations(now: number = Date.now()): Promise<AutomationResult[]> {
  const repo = getRepo();
  const [settings, apps] = await Promise.all([repo.getSettings(), repo.listApplications()]);
  const clientCache = new Map<string, Client | null>();
  const clientOf = async (app: Application) => {
    if (!clientCache.has(app.clientId)) clientCache.set(app.clientId, await repo.getClient(app.clientId));
    return clientCache.get(app.clientId) ?? null;
  };
  const results: AutomationResult[] = [];
  const claim = (key: string, rule: AutomationRule, ref?: string) => repo.claimAutomation(key, { rule, applicationRef: ref });

  for (const app of apps) {
    const idle = age(app.updatedAt, now);

    // 1. Stopped halfway: nudge after 1 hour, again after a day. Give up after a week.
    if (settings.nudgeStalled && !app.submittedAt && idle >= HOUR && idle < 7 * DAY) {
      const round = idle >= DAY ? 2 : 1;
      if (await claim(`nudge:${app.ref}:${round}`, "nudge_stalled", app.ref)) {
        if (round === 2) await claim(`nudge:${app.ref}:1`, "nudge_stalled", app.ref);
        await workflow.nudge(app.ref);
        results.push({ rule: "nudge_stalled", ref: app.ref, detail: `round ${round}` });
      }
      continue;
    }

    // 2. Quotes not chosen: remind after a day, again after three.
    if (settings.remindQuotes && app.status === "quotes_ready" && idle >= DAY) {
      const round = idle >= 3 * DAY ? 2 : 1;
      if (await claim(`quotes:${app.ref}:${round}`, "remind_quotes", app.ref)) {
        if (round === 2) await claim(`quotes:${app.ref}:1`, "remind_quotes", app.ref);
        const client = await clientOf(app);
        if (client) await workflow.remindQuotes(app, client);
        results.push({ rule: "remind_quotes", ref: app.ref, detail: `round ${round}` });
      }
      continue;
    }

    // 3. Chose a cover but hasn't paid: remind after 2 hours, again after a day.
    if (settings.remindPayment && app.status === "cover_chosen" && idle >= 2 * HOUR) {
      const round = idle >= DAY ? 2 : 1;
      if (await claim(`pay:${app.ref}:${round}`, "remind_payment", app.ref)) {
        if (round === 2) await claim(`pay:${app.ref}:1`, "remind_payment", app.ref);
        const client = await clientOf(app);
        if (client) await workflow.remindPayment(app, client);
        results.push({ rule: "remind_payment", ref: app.ref, detail: `round ${round}` });
      }
      continue;
    }

    // 4. Cover ending: remind 30, 14, 7 and 1 days before (only the nearest one due).
    if (settings.renewalReminders && app.status === "covered" && app.policy) {
      const left = daysLeft(app.policy.endsAt, now);
      if (left < 0 || left > RENEWAL_DAYS[0]) continue;
      if (apps.some((other) => other.details.renewalOf === app.ref && other.submittedAt)) continue; // already renewing
      const due = RENEWAL_DAYS.filter((n) => left <= n);
      const target = Math.min(...due);
      if (await claim(`renewal:${app.ref}:${target}`, "renewal", app.ref)) {
        for (const n of due) if (n !== target) await claim(`renewal:${app.ref}:${n}`, "renewal", app.ref);
        const client = await clientOf(app);
        if (client) await workflow.remindRenewal(app, client, Math.max(left, 1));
        results.push({ rule: "renewal", ref: app.ref, detail: `${left} days left` });
      }
    }
  }

  // 5. Once a day: tell the broker which covers end in the next 30 days.
  const today = new Date(now).toLocaleDateString("en-CA", { timeZone: brand.locale.timeZone });
  const due = renewalsDue(apps, now);
  if (due.length > 0 && (await claim(`digest:${today}`, "renewals_digest"))) {
    const names = await Promise.all(due.slice(0, 10).map(async (app) => (await clientOf(app))?.name ?? app.ref));
    const list = due
      .slice(0, 10)
      .map((app, i) => `• ${names[i]} — ${app.ref}, ends ${formatDate(app.policy!.endsAt)}`)
      .join("\n");
    await workflow.tellAdmin("renewals_due_admin", { count: due.length, list });
    results.push({ rule: "renewals_digest", detail: `${due.length} due` });
  }

  return results;
}

/** Covered applications ending within `withinDays`, soonest first. */
export function renewalsDue(apps: Application[], now: number = Date.now(), withinDays = 30): Application[] {
  return apps
    .filter((app) => app.status === "covered" && app.policy)
    .filter((app) => {
      const left = daysLeft(app.policy!.endsAt, now);
      return left >= 0 && left <= withinDays;
    })
    .sort((a, b) => Date.parse(a.policy!.endsAt) - Date.parse(b.policy!.endsAt));
}

/** Run at most every 10 minutes (shared across server instances via the repo). */
export async function maybeRunAutomations(now: number = Date.now()): Promise<AutomationResult[] | null> {
  const bucket = Math.floor(now / (10 * 60 * 1000));
  if (!(await getRepo().claimAutomation(`tick:${bucket}`, { rule: "tick" }))) return null;
  try {
    return await runAutomations(now);
  } catch {
    // A failed run must never break a page; the next tick tries again.
    return null;
  }
}
