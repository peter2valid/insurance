import type { SupabaseClient } from "@supabase/supabase-js";
import { brand } from "@/lib/brand";
import { NotFoundError } from "./errors";
import { productDocuments } from "./products";
import type { Repo, StoredFile } from "./repo";
import { createSeed } from "./seed";
import { DOCUMENTS_BUCKET } from "./supabase-client";
import type { Application, Client, DocumentItem, Message, Quote } from "./types";

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
    check(await db.from("applications").insert(seed.applications.map(appRow)), "seed applications");
    if (seed.quotes.length) check(await db.from("quotes").insert(seed.quotes.map(quoteRow)), "seed quotes");
    if (seed.messages.length) check(await db.from("messages").insert(seed.messages.map(messageRow)), "seed messages");
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
    const data = check(await db.from("applications").update(appRow(app)).eq("ref", app.ref).select("*").single(), "save application");
    await recordChange(app.ref);
    return toApp(data as Row);
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

    async createApplication({ clientId, product }) {
      const seq = check(await db.rpc("next_application_ref"), "next ref") as number;
      const ref = `${brand.refPrefix}-${seq}`;
      const at = now();
      const app: Application = {
        ref,
        clientId,
        product,
        status: "received",
        step: 1,
        details: {},
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
      for (const table of ["quotes", "messages", "outbox", "applications", "clients"]) {
        await db.from(table).delete().neq(table === "applications" ? "ref" : "id", "");
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
