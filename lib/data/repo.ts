import type {
  Agent,
  Application,
  ApplicationStatus,
  Channel,
  Client,
  Commission,
  DocumentItem,
  MessageDirection,
  Message,
  Payment,
  Policy,
  Product,
  Quote,
  Settings,
} from "./types";
import { createMockRepo } from "./mock";
import { createSupabaseRepo } from "./supabase";
import { getSupabase } from "./supabase-client";

/**
 * The ONLY way screens touch data (CLAUDE.md §6). Screens import
 * `getRepo()` from here and never import ./mock directly.
 *
 * Server-side only: call from Server Components, Server Actions and Route
 * Handlers. Swapping to Supabase means writing a second implementation of
 * `Repo` and changing `getRepo()` below — nothing outside lib/data changes.
 */
export interface Repo {
  // Clients
  getClient(id: string): Promise<Client | null>;
  findClientByPhone(phone: string): Promise<Client | null>;
  createClient(input: { phone: string; name?: string }): Promise<Client>;
  updateClient(id: string, patch: Partial<Pick<Client, "name" | "email" | "idNumber">>): Promise<Client>;

  // Applications
  listApplications(): Promise<Application[]>;
  listApplicationsForClient(clientId: string): Promise<Application[]>;
  getApplication(ref: string): Promise<Application | null>;
  createApplication(input: {
    clientId: string;
    product: Product;
    agentId?: string;
    /** Pre-filled answers, e.g. when renewing last year's cover. */
    details?: Record<string, string>;
  }): Promise<Application>;
  /** Save flow progress: merges details, advances step (never backwards). */
  saveProgress(ref: string, input: { step: number; details?: Record<string, string> }): Promise<Application>;
  submitApplication(ref: string): Promise<Application>;
  setStatus(ref: string, status: ApplicationStatus): Promise<Application>;
  setPolicy(ref: string, policy: Policy): Promise<Application>;
  setAgent(ref: string, agentId: string): Promise<Application>;
  updateDocument(
    ref: string,
    documentId: string,
    patch: Partial<Pick<DocumentItem, "status" | "fileName" | "fileUrl" | "uploadedAt" | "rejectionReason">>,
  ): Promise<Application>;

  // Quotes
  listQuotes(ref: string): Promise<Quote[]>;
  addQuote(ref: string, input: Omit<Quote, "id" | "applicationRef" | "createdAt" | "chosen">): Promise<Quote>;
  chooseQuote(ref: string, quoteId: string): Promise<Quote>;

  // Messages (conversation log per application)
  listMessages(ref?: string): Promise<Message[]>;
  addMessage(input: {
    applicationRef: string;
    direction: MessageDirection;
    channel: Channel;
    body: string;
  }): Promise<Message>;
  markMessagesRead(ref: string): Promise<void>;

  // Payments (M-Pesa — SIMULATED behind lib/payments)
  listPayments(ref?: string): Promise<Payment[]>;
  createPayment(input: Omit<Payment, "id" | "createdAt" | "status">): Promise<Payment>;
  updatePayment(id: string, patch: Partial<Pick<Payment, "status" | "receipt" | "paidAt">>): Promise<Payment>;

  // Agents and their commissions
  listAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  findAgentByPhone(phone: string): Promise<Agent | null>;
  findAgentByCode(code: string): Promise<Agent | null>;
  createAgent(input: Omit<Agent, "id" | "createdAt">): Promise<Agent>;
  updateAgent(id: string, patch: Partial<Omit<Agent, "id" | "createdAt">>): Promise<Agent>;
  listCommissions(agentId?: string): Promise<Commission[]>;
  createCommission(input: Omit<Commission, "id" | "createdAt" | "status" | "paidAt">): Promise<Commission>;
  updateCommission(id: string, patch: Partial<Pick<Commission, "status" | "paidAt">>): Promise<Commission>;

  // Broker settings (automations on/off, default commission)
  getSettings(): Promise<Settings>;
  updateSettings(patch: Partial<Settings>): Promise<Settings>;

  /**
   * Automations run at most once per key (e.g. "renewal:BC-5003:30").
   * Returns true the first time a key is claimed, false after that.
   */
  claimAutomation(key: string, input: { rule: string; applicationRef?: string }): Promise<boolean>;
  listAutomationRuns(limit?: number): Promise<AutomationRun[]>;

  // Files (logbook, ID photos). Mock: in memory. Later: Supabase Storage.
  saveFile(input: { name: string; type: string; bytes: Uint8Array }): Promise<StoredFile>;
  getFile(id: string): Promise<(StoredFile & { bytes: Uint8Array }) | null>;

  /** Demo only (Stage 10): restore seed data. */
  reset(): Promise<void>;
}

export type AutomationRun = { key: string; rule: string; applicationRef?: string; createdAt: string };

export type StoredFile = { id: string; name: string; type: string; size: number; url: string };

export { NotFoundError } from "./errors";

let repo: Repo | undefined;

export function getRepo(): Repo {
  // Supabase when its keys are set (deployed demo); otherwise the
  // SIMULATED in-memory mock (local development, no setup needed).
  const db = getSupabase();
  repo ??= db ? createSupabaseRepo(db) : createMockRepo();
  return repo;
}
