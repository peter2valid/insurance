import { brand } from "@/lib/brand";
import { notifySubjects } from "@/lib/copy";
import { getSupabase } from "@/lib/data/supabase-client";
import { publish, subscribe } from "@/lib/events";
import { isSampleNumber } from "@/lib/whatsapp";
import { adminEmail, emailConfigured, sendEmail } from "./email";
import { sendWhatsApp, twilioConfigured } from "./twilio";
import { renderTemplate, type Delivery, type Notifier, type OutboxItem } from "./types";

/**
 * The notifier. Every message is written to the Outbox (a Supabase table
 * when configured, otherwise in memory), and admin pages get a toast.
 *
 * Messages are SIMULATED unless a provider is configured:
 * - WhatsApp: Twilio (demo sandbox) — to clients/agents who opted in, and
 *   to the agency's own number for admin alerts. Never to sample numbers.
 * - Email: Resend — to real addresses only (never the seed's example.com).
 * The Outbox labels each message honestly: sent, failed or simulated.
 * Never logs message contents: they contain personal data (CLAUDE.md §9).
 */

type Outbox = { items: OutboxItem[]; nextId: number; resetHooked: boolean };

const globalOutbox = globalThis as unknown as { __beaconOutbox?: Outbox };
const outbox = (globalOutbox.__beaconOutbox ??= { items: [], nextId: 1, resetHooked: false });

// Clear the outbox when the demo data is reset.
if (!outbox.resetHooked) {
  outbox.resetHooked = true;
  subscribe((event) => {
    if (event.type === "demo.reset") outbox.items = [];
  });
}

/** The agency's own WhatsApp, for admin alerts (ADMIN_WHATSAPP overrides). */
function adminWhatsApp(): string {
  const raw = process.env.ADMIN_WHATSAPP?.replace(/\D/g, "") || brand.contact.whatsappE164;
  return `+${raw}`;
}

const isSampleEmail = (email: string) => /@example\.(com|org|net)$/i.test(email);

async function deliver(item: OutboxItem): Promise<Delivery> {
  if (item.channel === "whatsapp" && twilioConfigured()) {
    const to = item.audience === "admin" ? adminWhatsApp() : item.to;
    if (!/^\+\d{10,15}$/.test(to) || isSampleNumber(to)) return "simulated";
    return (await sendWhatsApp(to, item.body)) ? "sent" : "failed";
  }
  if (item.channel === "email" && emailConfigured()) {
    const to = item.audience === "admin" ? adminEmail() : item.to;
    if (!to || !to.includes("@") || isSampleEmail(to)) return "simulated";
    const subject = notifySubjects[item.template] ?? brand.name;
    return (await sendEmail(to, subject, item.body)) ? "sent" : "failed";
  }
  return "simulated";
}

export const simulatedNotifier: Notifier = {
  async send(input) {
    const item: OutboxItem = {
      id: `out-${outbox.nextId++}`,
      channel: input.channel,
      to: input.to,
      audience: input.audience,
      template: input.template,
      body: renderTemplate(input.template, input.data),
      applicationRef: input.applicationRef,
      createdAt: new Date().toISOString(),
      delivery: "simulated",
    };
    item.delivery = await deliver(item);

    const db = getSupabase();
    if (db) {
      item.id = `out-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const row = {
        id: item.id,
        channel: item.channel,
        recipient: item.to,
        audience: item.audience,
        template: item.template,
        body: item.body,
        application_ref: item.applicationRef ?? null,
        created_at: item.createdAt,
      };
      const { error } = await db.from("outbox").insert({ ...row, delivery: item.delivery });
      // Database not yet migrated (no "delivery" column): still keep the log.
      if (error) await db.from("outbox").insert(row);
      // A change with no ref reaches every admin page (for the toast).
      await db.from("changes").insert({ ref: null });
      return item;
    }
    outbox.items.unshift(item);
    if (outbox.items.length > 500) outbox.items.length = 500;
    publish({ type: "outbox.sent", id: item.id, ref: item.applicationRef });
    return structuredClone(item);
  },

  async listOutbox() {
    const db = getSupabase();
    if (db) {
      const { data } = await db.from("outbox").select("*").order("created_at", { ascending: false }).limit(300);
      return (data ?? []).map((row) => ({
        id: row.id as string,
        channel: row.channel as OutboxItem["channel"],
        to: row.recipient as string,
        audience: row.audience as OutboxItem["audience"],
        template: row.template as OutboxItem["template"],
        body: row.body as string,
        applicationRef: (row.application_ref as string) ?? undefined,
        createdAt: row.created_at as string,
        delivery: ((row.delivery as Delivery) ?? "simulated") as Delivery,
      }));
    }
    return structuredClone(outbox.items);
  },
};
