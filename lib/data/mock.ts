import { brand } from "@/lib/brand";
import { publish } from "@/lib/events";
import { NotFoundError } from "./errors";
import { motorDocuments } from "./products";
import type { Repo } from "./repo";
import { createSeed } from "./seed";
import type { Application, Client, Message, Quote } from "./types";

/**
 * SIMULATED repository: in-memory, seeded with realistic data.
 * Do not import from screens — use getRepo() from ./repo.
 *
 * Every write publishes an event (lib/events) so open client and admin
 * pages can refresh together. Reads return copies, so callers can't
 * mutate the store by accident.
 */

type StoredBytes = { id: string; name: string; type: string; bytes: Uint8Array };

type Store = {
  files: Map<string, StoredBytes>;
  clients: Map<string, Client>;
  applications: Map<string, Application>;
  quotes: Quote[];
  messages: Message[];
  nextRef: number;
  nextId: number;
};

function freshStore(): Store {
  const seed = createSeed();
  const highest = Math.max(...seed.applications.map((app) => Number(app.ref.split("-")[1])));
  return {
    files: new Map(),
    clients: new Map(seed.clients.map((client) => [client.id, client])),
    applications: new Map(seed.applications.map((app) => [app.ref, app])),
    quotes: seed.quotes,
    messages: seed.messages,
    nextRef: highest + 1,
    nextId: 1,
  };
}

// Kept on globalThis so dev hot-reload doesn't wipe the demo mid-walkthrough.
const globalStore = globalThis as unknown as { __beaconStore?: Store };

function store(): Store {
  return (globalStore.__beaconStore ??= freshStore());
}

const clone = <T>(value: T): T => structuredClone(value);
const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${store().nextId++}`;

function requireApp(ref: string): Application {
  const app = store().applications.get(ref);
  if (!app) throw new NotFoundError(`Application ${ref}`);
  return app;
}

function touch(app: Application): Application {
  app.updatedAt = now();
  return app;
}

export function createMockRepo(): Repo {
  return {
    // Clients
    async getClient(id) {
      const client = store().clients.get(id);
      return client ? clone(client) : null;
    },

    async findClientByPhone(phone) {
      for (const client of store().clients.values()) {
        if (client.phone === phone) return clone(client);
      }
      return null;
    },

    async createClient({ phone, name }) {
      const client: Client = { id: newId("client"), phone, name: name ?? "", createdAt: now() };
      store().clients.set(client.id, client);
      return clone(client);
    },

    async updateClient(id, patch) {
      const client = store().clients.get(id);
      if (!client) throw new NotFoundError(`Client ${id}`);
      Object.assign(client, patch);
      return clone(client);
    },

    // Applications
    async listApplications() {
      return clone([...store().applications.values()]);
    },

    async listApplicationsForClient(clientId) {
      return clone([...store().applications.values()].filter((app) => app.clientId === clientId));
    },

    async getApplication(ref) {
      const app = store().applications.get(ref);
      return app ? clone(app) : null;
    },

    async createApplication({ clientId, product }) {
      const s = store();
      const ref = `${brand.refPrefix}-${s.nextRef++}`;
      const at = now();
      const app: Application = {
        ref,
        clientId,
        product,
        status: "received",
        step: 1, // phone verified
        details: {},
        documents: motorDocuments.map((doc) => ({
          id: `${ref}-${doc.type}`,
          type: doc.type,
          required: doc.required,
          status: "needed",
        })),
        updatedAt: at,
        createdAt: at,
      };
      s.applications.set(ref, app);
      publish({ type: "application.created", ref });
      return clone(app);
    },

    async saveProgress(ref, { step, details }) {
      const app = requireApp(ref);
      app.step = Math.max(app.step, step);
      if (details) app.details = { ...app.details, ...details };
      touch(app);
      publish({ type: "application.updated", ref });
      return clone(app);
    },

    async submitApplication(ref) {
      const app = requireApp(ref);
      if (!app.submittedAt) {
        app.submittedAt = now();
        app.status = "received";
      }
      touch(app);
      publish({ type: "application.submitted", ref });
      return clone(app);
    },

    async setStatus(ref, status) {
      const app = requireApp(ref);
      app.status = status;
      touch(app);
      publish({ type: "application.updated", ref });
      return clone(app);
    },

    async updateDocument(ref, documentId, patch) {
      const app = requireApp(ref);
      const doc = app.documents.find((item) => item.id === documentId);
      if (!doc) throw new NotFoundError(`Document ${documentId}`);
      Object.assign(doc, patch);
      if (patch.status && patch.status !== "rejected") delete doc.rejectionReason;
      touch(app);
      publish({ type: "application.updated", ref });
      return clone(app);
    },

    // Quotes
    async listQuotes(ref) {
      return clone(store().quotes.filter((quote) => quote.applicationRef === ref));
    },

    async addQuote(ref, input) {
      requireApp(ref);
      const quote: Quote = { ...input, id: newId("quote"), applicationRef: ref, createdAt: now() };
      store().quotes.push(quote);
      publish({ type: "quote.added", ref });
      return clone(quote);
    },

    async chooseQuote(ref, quoteId) {
      const app = requireApp(ref);
      let chosen: Quote | undefined;
      for (const quote of store().quotes) {
        if (quote.applicationRef !== ref) continue;
        quote.chosen = quote.id === quoteId;
        if (quote.chosen) chosen = quote;
      }
      if (!chosen) throw new NotFoundError(`Quote ${quoteId}`);
      app.status = "cover_chosen";
      touch(app);
      publish({ type: "application.updated", ref });
      return clone(chosen);
    },

    // Messages
    async listMessages(ref) {
      const all = store().messages;
      return clone(ref ? all.filter((message) => message.applicationRef === ref) : all);
    },

    async addMessage({ applicationRef, direction, channel, body }) {
      const app = requireApp(applicationRef);
      const message: Message = {
        id: newId("msg"),
        applicationRef,
        direction,
        channel,
        body,
        read: direction === "out",
        createdAt: now(),
      };
      store().messages.push(message);
      if (direction === "in") touch(app);
      publish({ type: "message.added", ref: applicationRef });
      return clone(message);
    },

    async markMessagesRead(ref) {
      let changed = false;
      for (const message of store().messages) {
        if (message.applicationRef === ref && !message.read) {
          message.read = true;
          changed = true;
        }
      }
      if (changed) publish({ type: "application.updated", ref });
    },

    // Files — SIMULATED storage, served by app/files/[id]/route.ts.
    async saveFile({ name, type, bytes }) {
      const id = newId("file");
      store().files.set(id, { id, name, type, bytes });
      return { id, name, type, size: bytes.byteLength, url: `/files/${id}` };
    },

    async getFile(id) {
      const file = store().files.get(id);
      if (!file) return null;
      return { id, name: file.name, type: file.type, size: file.bytes.byteLength, url: `/files/${id}`, bytes: file.bytes };
    },

    async reset() {
      globalStore.__beaconStore = freshStore();
      publish({ type: "demo.reset" });
    },
  };
}
