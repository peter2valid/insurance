import type {
  Application,
  ApplicationStatus,
  Channel,
  Client,
  DocumentItem,
  MessageDirection,
  Message,
  Product,
  Quote,
} from "./types";
import { createMockRepo } from "./mock";

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
  createApplication(input: { clientId: string; product: Product }): Promise<Application>;
  /** Save flow progress: merges details, advances step (never backwards). */
  saveProgress(ref: string, input: { step: number; details?: Record<string, string> }): Promise<Application>;
  submitApplication(ref: string): Promise<Application>;
  setStatus(ref: string, status: ApplicationStatus): Promise<Application>;
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

  /** Demo only (Stage 10): restore seed data. */
  reset(): Promise<void>;
}

export { NotFoundError } from "./errors";

let repo: Repo | undefined;

export function getRepo(): Repo {
  // SIMULATED: in-memory mock. Later: `repo ??= createSupabaseRepo()`.
  repo ??= createMockRepo();
  return repo;
}
