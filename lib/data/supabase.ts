import type { SupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/lib/brand";
import { NotFoundError } from "./errors";
import { productDocuments } from "./products";
import type { AutomationRun, Repo, StoredFile } from "./repo";
import { createSeed } from "./seed";
import { DOCUMENTS_BUCKET } from "./supabase-client";
import {
  defaultSettings,
  type Agent,
  type Application,
  type Client,
  type Commission,
  type DocumentItem,
  type Message,
  type Payment,
  type Policy,
  type Quote,
  type QuoteBreakdown,
  type Settings,
} from "./types";

/**
 * Repo backed by Supabase (Postgres + Storage). Used when SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set; same interface as the mock, so no
 * screen changes. Seeds the demo data on first use. Every write records a
 * row in `changes`, which open pages poll to stay in sync (lib/events.ts).
 */

type Row = Record<string, unknown>;

const toClient = (r: Row): Client => ({
  id: r.id as string,
  name: (r.name as string) ?? "",
  phone: r.phone as string,
  email: (r.email as string) ?? undefined,
  idNumber: (r.id_number as string) ?? undefined,
  createdAt: r.created_at as string,
});

const toApp = (r: Row): Application => ({
  ref: r.ref as string,
  clientId: r.client_id as string,
  product: r.product as Application["product"],
  status: r.status as Application["status"],
  step: r.step as number,
  details: (r.details as Record<string, string>) ?? {},
  documents: (r.documents as DocumentItem[]) ?? [],
  submittedAt: (r.submitted_at as string) ?? undefined,
  agentId: (r.agent_id as string) ?? undefined,
  policy: (r.policy as Policy) ?? undefined,
  updatedAt: r.updated_at as string,
  createdAt: r.created_at as string,
});

const appRow = (a: Application): Row => ({
  ref: a.ref,
  client_id: a.clientId,
  product: a.product,
  status: a.status,
  step: a.step,
  details: a.details,
  documents: a.documents,
  submitted_at: a.submittedAt ?? null,
  agent_id: a.agentId ?? null,
  policy: a.policy ?? null,
  updated_at: a.updatedAt,
  created_at: a.createdAt,
});

const toQuote = (r: Row): Quote => ({
  id: r.id as string,
  applicationRef: r.application_ref as string,
  insurer: r.insurer as string,
  coverType: r.cover_type as string,
  premiumKes: r.premium_kes as number,
  excessKes: (r.excess_kes as number) ?? undefined,
  benefits: (r.benefits as string[]) ?? [],
  breakdown: (r.breakdown as QuoteBreakdown) ?? undefined,
  period: (r.period as Quote["period"]) ?? undefined,
  chosen: Boolean(r.chosen),
  createdAt: r.created_at as string,
});

const quoteRow = (q: Quote): Row => ({
  id: q.id,
  application_ref: q.applicationRef,
  insurer: q.insurer,
  cover_type: q.coverType,
  premium_kes: q.premiumKes,
  excess_kes: q.excessKes ?? null,
  benefits: q.benefits,
  breakdown: q.breakdown ?? null,
  period: q.period ?? "annual",
  chosen: Boolean(q.chosen),
  created_at: q.createdAt,
});

const toMessage = (r: Row): Message => ({
  id: r.id as string,
  applicationRef: r.application_ref as string,
  direction: r.direction as Message["direction"],
  channel: r.channel as Message["channel"],
  body: r.body as string,
  read: Boolean(r.read),
  createdAt: r.created_at as string,
});

const messageRow = (m: Message): Row => ({
  id: m.id,
  application_ref: m.applicationRef,
  direction: m.direction,
  channel: m.channel,
  body: m.body,
  read: m.read,
  created_at: m.createdAt,
});

const toPayment = (r: Row): Payment => ({
  id: r.id as string,
  applicationRef: r.application_ref as string,
  amountKes: r.amount_kes as number,
  method: "mpesa",
  phone: r.phone as string,
  status: r.status as Payment["status"],
  receipt: (r.receipt as string) ?? undefined,
  createdAt: r.created_at as string,
  paidAt: (r.paid_at as string) ?? undefined,
});

const paymentRow = (p: Payment): Row => ({
  id: p.id,
  application_ref: p.applicationRef,
  amount_kes: p.amountKes,
  method: p.method,
  phone: p.phone,
  status: p.status,
  receipt: p.receipt ?? null,
  created_at: p.createdAt,
  paid_at: p.paidAt ?? null,
});

const toAgent = (r: Row): Agent => ({
  id: r.id as string,
  name: r.name as string,
  phone: r.phone as string,
  email: (r.email as string) ?? undefined,
  code: r.code as string,
  commissionRate: Number(r.commission_rate),
  status: r.status as Agent["status"],
  createdAt: r.created_at as string,
});

const agentRow = (a: Partial<Agent>): Row => {
  const row: Row = {};
  if (a.id !== undefined) row.id = a.id;
  if (a.name !== undefined) row.name = a.name;
  if (a.phone !== undefined) row.phone = a.phone;
  if ("email" in a) row.email = a.email ?? null;
  if (a.code !== undefined) row.code = a.code;
  if (a.commissionRate !== undefined) row.commission_rate = a.commissionRate;
  if (a.status !== undefined) row.status = a.status;
  if (a.createdAt !== undefined) row.created_at = a.createdAt;
  return row;
};

const toCommission = (r: Row): Commission => ({
  id: r.id as string,
  agentId: r.agent_id as string,
  applicationRef: r.application_ref as string,
  premiumKes: r.premium_kes as number,
  rate: Number(r.rate),
  amountKes: r.amount_kes as number,
  status: r.status as Commission["status"],
  createdAt: r.created_at as string,
  paidAt: (r.paid_at as string) ?? undefined,
});

const commissionRow = (c: Commission): Row => ({
  id: c.id,
  agent_id: c.agentId,
  application_ref: c.applicationRef,
  premium_kes: c.premiumKes,
  rate: c.rate,
  amount_kes: c.amountKes,
  status: c.status,
  created_at: c.createdAt,
  paid_at: c.paidAt ?? null,
});

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Throw on Supabase errors with a message that doesn't leak personal data. */
function check<T>(result: { data: T; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Supabase ${what} failed: ${result.error.message}`);
  return result.data;
}

export function createSupabaseRepo(db: SupabaseClient): Repo {
  let seeded: Promise<void> | null = null;

  async function recordChange(ref: string | null) {
    await db.from("changes").insert({ ref });
  }

  async function insertSeed() {
    const seed = createSeed();
    check(await db.from("clients").insert(seed.clients.map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email ?? null, id_number: c.idNumber ?? null, created_at: c.createdAt,
    }))), "seed clients");
    check(await db.from("agents").insert(seed.agents.map(agentRow)), "seed agents");
    check(await db.from("applications").insert(seed.applications.map(appRow)), "seed applications");
    if (seed.quotes.length) check(await db.from("quotes").insert(seed.quotes.map(quoteRow)), "seed quotes");
    if (seed.messages.length) check(await db.from("messages").insert(seed.messages.map(messageRow)), "seed messages");
    if (seed.payments.length) check(await db.from("payments").insert(seed.payments.map(paymentRow)), "seed payments");
    if (seed.commissions.length) check(await db.from("commissions").insert(seed.commissions.map(commissionRow)), "seed commissions");
  }

  /** Seed the demo data the first time the database is used. */
  function ensureSeeded(): Promise<void> {
    seeded ??= (async () => {
      const { count } = await db.from("applications").select("ref", { count: "exact", head: true });
      if ((count ?? 0) === 0) {
        try {
          await insertSeed();
        } catch {
          // Another request may have seeded at the same moment; that's fine.
        }
      }
    })();
    return seeded;
  }

  async function requireApp(ref: string): Promise<Application> {
    await ensureSeeded();
    const { data } = await db.from("applications").select("*").eq("ref", ref).maybeSingle();
    if (!data) throw new NotFoundError(`Application ${ref}`);
    return toApp(data);
  }

  async function saveApp(app: Application): Promise<Application> {
    app.updatedAt = now();
    // Save and record the change at the same time (one round trip, not two).
    const [result] = await Promise.all([
      db.from("applications").update(appRow(app)).eq("ref", app.ref).select("*").single(),
      recordChange(app.ref),
    ]);
    return toApp(check(result, "save application") as Row);
  }

  return {
    async getClient(id) {
      await ensureSeeded();
      const { data } = await db.from("clients").select("*").eq("id", id).maybeSingle();
      return data ? toClient(data) : null;
    },

    async findClientByPhone(phone) {
      await ensureSeeded();
      const { data } = await db.from("clients").select("*").eq("phone", phone).maybeSingle();
      return data ? toClient(data) : null;
    },

    async createClient({ phone, name }) {
      const row = { id: newId("client"), phone, name: name ?? "", created_at: now() };
      const data = check(await db.from("clients").insert(row).select("*").single(), "create client");
      return toClient(data as Row);
    },

    async updateClient(id, patch) {
      const row: Row = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.email !== undefined) row.email = patch.email;
      if (patch.idNumber !== undefined) row.id_number = patch.idNumber;
      const { data } = await db.from("clients").update(row).eq("id", id).select("*").maybeSingle();
      if (!data) throw new NotFoundError(`Client ${id}`);
      return toClient(data);
    },

    async listApplications() {
      await ensureSeeded();
      const data = check(await db.from("applications").select("*"), "list applications");
      return (data as Row[]).map(toApp);
    },

    async listApplicationsForClient(clientId) {
      await ensureSeeded();
      const data = check(await db.from("applications").select("*").eq("client_id", clientId), "list client applications");
      return (data as Row[]).map(toApp);
    },

    async getApplication(ref) {
      await ensureSeeded();
      const { data } = await db.from("applications").select("*").eq("ref", ref).maybeSingle();
      return data ? toApp(data) : null;
    },

    async createApplication({ clientId, product, agentId, details }) {
      const seq = check(await db.rpc("next_application_ref"), "next ref") as number;
      const ref = `${brand.refPrefix}-${seq}`;
      const at = now();
      const app: Application = {
        ref,
        clientId,
        product,
        status: "received",
        step: 1,
        details: { ...details },
        ...(agentId && { agentId }),
        documents: productDocuments[product].map((doc) => ({
          id: `${ref}-${doc.type}`,
          type: doc.type,
          required: doc.required,
          status: "needed",
        })),
        updatedAt: at,
        createdAt: at,
      };
      check(await db.from("applications").insert(appRow(app)), "create application");
      await recordChange(ref);
      return app;
    },

    async saveProgress(ref, { step, details }) {
      const app = await requireApp(ref);
      app.step = Math.max(app.step, step);
      if (details) app.details = { ...app.details, ...details };
      return saveApp(app);
    },

    async submitApplication(ref) {
      const app = await requireApp(ref);
      if (!app.submittedAt) {
        app.submittedAt = now();
        app.status = "received";
      }
      return saveApp(app);
    },

    async setStatus(ref, status) {
      const app = await requireApp(ref);
      app.status = status;
      return saveApp(app);
    },

    async setPolicy(ref, policy) {
      const app = await requireApp(ref);
      app.policy = policy;
      return saveApp(app);
    },

    async setAgent(ref, agentId) {
      const app = await requireApp(ref);
      app.agentId = agentId;
      return saveApp(app);
    },

    async updateDocument(ref, documentId, patch) {
      const app = await requireApp(ref);
      const doc = app.documents.find((item) => item.id === documentId);
      if (!doc) throw new NotFoundError(`Document ${documentId}`);
      Object.assign(doc, patch);
      if (patch.status && patch.status !== "rejected") delete doc.rejectionReason;
      return saveApp(app);
    },

    async listQuotes(ref) {
      await ensureSeeded();
      const data = check(await db.from("quotes").select("*").eq("application_ref", ref).order("created_at"), "list quotes");
      return (data as Row[]).map(toQuote);
    },

    async addQuote(ref, input) {
      await requireApp(ref);
      const quote: Quote = { ...input, id: newId("quote"), applicationRef: ref, createdAt: now() };
      check(await db.from("quotes").insert(quoteRow(quote)), "add quote");
      await recordChange(ref);
      return quote;
    },

    async chooseQuote(ref, quoteId) {
      const app = await requireApp(ref);
      check(await db.from("quotes").update({ chosen: false }).eq("application_ref", ref), "clear choice");
      const { data } = await db.from("quotes").update({ chosen: true }).eq("id", quoteId).eq("application_ref", ref).select("*").maybeSingle();
      if (!data) throw new NotFoundError(`Quote ${quoteId}`);
      app.status = "cover_chosen";
      await saveApp(app);
      return toQuote(data);
    },

    async listMessages(ref) {
      await ensureSeeded();
      let query = db.from("messages").select("*").order("created_at");
      if (ref) query = query.eq("application_ref", ref);
      const data = check(await query, "list messages");
      return (data as Row[]).map(toMessage);
    },

    async addMessage({ applicationRef, direction, channel, body }) {
      const app = await requireApp(applicationRef);
      const message: Message = {
        id: newId("msg"),
        applicationRef,
        direction,
        channel,
        body,
        read: direction === "out",
        createdAt: now(),
      };
      check(await db.from("messages").insert(messageRow(message)), "add message");
      if (direction === "in") await saveApp(app);
      else await recordChange(applicationRef);
      return message;
    },

    async markMessagesRead(ref) {
      const { data } = await db
        .from("messages")
        .update({ read: true })
        .eq("application_ref", ref)
        .eq("read", false)
        .select("id");
      if (data && data.length > 0) await recordChange(ref);
    },

    async listPayments(ref) {
      await ensureSeeded();
      let query = db.from("payments").select("*").order("created_at");
      if (ref) query = query.eq("application_ref", ref);
      return (check(await query, "list payments") as Row[]).map(toPayment);
    },

    async createPayment(input) {
      const payment: Payment = { ...input, id: newId("pay"), status: "pending", createdAt: now() };
      check(await db.from("payments").insert(paymentRow(payment)), "create payment");
      await recordChange(input.applicationRef);
      return payment;
    },

    async updatePayment(id, patch) {
      const row: Row = {};
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.receipt !== undefined) row.receipt = patch.receipt;
      if (patch.paidAt !== undefined) row.paid_at = patch.paidAt;
      const { data } = await db.from("payments").update(row).eq("id", id).select("*").maybeSingle();
      if (!data) throw new NotFoundError(`Payment ${id}`);
      const payment = toPayment(data);
      await recordChange(payment.applicationRef);
      return payment;
    },

    async listAgents() {
      await ensureSeeded();
      return (check(await db.from("agents").select("*").order("created_at"), "list agents") as Row[]).map(toAgent);
    },

    async getAgent(id) {
      await ensureSeeded();
      const { data } = await db.from("agents").select("*").eq("id", id).maybeSingle();
      return data ? toAgent(data) : null;
    },

    async findAgentByPhone(phone) {
      await ensureSeeded();
      const { data } = await db.from("agents").select("*").eq("phone", phone).maybeSingle();
      return data ? toAgent(data) : null;
    },

    async findAgentByCode(code) {
      await ensureSeeded();
      const { data } = await db.from("agents").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();
      return data ? toAgent(data) : null;
    },

    async createAgent(input) {
      const agent: Agent = { ...input, id: newId("agent"), createdAt: now() };
      check(await db.from("agents").insert(agentRow(agent)), "create agent");
      await recordChange(null);
      return agent;
    },

    async updateAgent(id, patch) {
      const { data } = await db.from("agents").update(agentRow(patch)).eq("id", id).select("*").maybeSingle();
      if (!data) throw new NotFoundError(`Agent ${id}`);
      await recordChange(null);
      return toAgent(data);
    },

    async listCommissions(agentId) {
      await ensureSeeded();
      let query = db.from("commissions").select("*").order("created_at", { ascending: false });
      if (agentId) query = query.eq("agent_id", agentId);
      return (check(await query, "list commissions") as Row[]).map(toCommission);
    },

    async createCommission(input) {
      const commission: Commission = { ...input, id: newId("com"), status: "pending", createdAt: now() };
      check(await db.from("commissions").insert(commissionRow(commission)), "create commission");
      await recordChange(null);
      return commission;
    },

    async updateCommission(id, patch) {
      const row: Row = {};
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.paidAt !== undefined) row.paid_at = patch.paidAt;
      const { data } = await db.from("commissions").update(row).eq("id", id).select("*").maybeSingle();
      if (!data) throw new NotFoundError(`Commission ${id}`);
      await recordChange(null);
      return toCommission(data);
    },

    async getSettings() {
      const { data } = await db.from("settings").select("value").eq("id", "broker").maybeSingle();
      return { ...defaultSettings, ...((data?.value as Partial<Settings>) ?? {}) };
    },

    async updateSettings(patch) {
      const { data } = await db.from("settings").select("value").eq("id", "broker").maybeSingle();
      const value: Settings = { ...defaultSettings, ...((data?.value as Partial<Settings>) ?? {}), ...patch };
      check(await db.from("settings").upsert({ id: "broker", value }), "save settings");
      await recordChange(null);
      return value;
    },

    async claimAutomation(key, { rule, applicationRef }) {
      // The primary key makes this atomic: a second claim of the same key fails.
      const { error } = await db.from("automation_runs").insert({ key, rule, application_ref: applicationRef ?? null });
      return !error;
    },

    async listAutomationRuns(limit = 100): Promise<AutomationRun[]> {
      const { data } = await db.from("automation_runs").select("*").order("created_at", { ascending: false }).limit(limit);
      return (data ?? []).map((r) => ({
        key: r.key as string,
        rule: r.rule as string,
        applicationRef: (r.application_ref as string) ?? undefined,
        createdAt: r.created_at as string,
      }));
    },

    async saveFile({ name, type, bytes }): Promise<StoredFile> {
      const id = newId("file");
      const path = `${id}/${name.replace(/[^\w.-]+/g, "_")}`;
      check(await db.storage.from(DOCUMENTS_BUCKET).upload(path, bytes, { contentType: type, upsert: false }), "upload file");
      check(await db.from("files").insert({ id, name, type, size: bytes.byteLength, path }), "save file");
      return { id, name, type, size: bytes.byteLength, url: `/files/${id}` };
    },

    async getFile(id) {
      const { data: meta } = await db.from("files").select("*").eq("id", id).maybeSingle();
      if (!meta) return null;
      const { data: blob } = await db.storage.from(DOCUMENTS_BUCKET).download(meta.path as string);
      if (!blob) return null;
      const bytes = new Uint8Array(await blob.arrayBuffer());
      return { id, name: meta.name as string, type: meta.type as string, size: bytes.byteLength, url: `/files/${id}`, bytes };
    },

    async reset() {
      // Children first (foreign keys), then reseed.
      const keyOf: Record<string, string> = { applications: "ref", automation_runs: "key" };
      const tables = ["commissions", "payments", "quotes", "messages", "outbox", "automation_runs", "applications", "clients", "agents"];
      for (const table of tables) {
        await db.from(table).delete().neq(keyOf[table] ?? "id", "");
      }
      const { data: files } = await db.from("files").select("path");
      if (files && files.length > 0) {
        await db.storage.from(DOCUMENTS_BUCKET).remove(files.map((f) => f.path as string));
        await db.from("files").delete().neq("id", "");
      }
      await insertSeed();
      seeded = Promise.resolve();
      await recordChange(null);
    },
  };
}
