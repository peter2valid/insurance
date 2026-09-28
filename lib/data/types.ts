/**
 * Domain types (CLAUDE.md §6). Shared by the mock repo today and the
 * Supabase repo later — screens depend on these, never on storage.
 */

export type ApplicationStatus =
  | "received"
  | "documents_checked"
  | "preparing_quotes"
  | "needs_info"
  | "quotes_ready"
  | "cover_chosen"
  | "covered";

export const applicationStatuses: readonly ApplicationStatus[] = [
  "received",
  "documents_checked",
  "preparing_quotes",
  "needs_info",
  "quotes_ready",
  "cover_chosen",
  "covered",
];

export type Product = "motor"; // more later (CLAUDE.md §12)

export type DocumentType = "logbook" | "national_id" | "kra_pin" | "driving_licence";

export type DocumentStatus = "needed" | "uploaded" | "verified" | "rejected";

export interface DocumentItem {
  id: string;
  type: DocumentType;
  required: boolean;
  status: DocumentStatus;
  fileName?: string;
  /** Where the file lives. Mock: a data/blob URL or nothing; later: Supabase storage path. */
  fileUrl?: string;
  uploadedAt?: string;
  /** Plain-language reason shown to the client, e.g. "The photo is blurry." */
  rejectionReason?: string;
}

export interface Client {
  id: string;
  name: string;
  /** E.164, e.g. "+254712345678". Also the login (phone + code). */
  phone: string;
  email?: string;
  /** Sensitive: mask in list views (lib/format/mask). */
  idNumber?: string;
  createdAt: string;
}

export interface Application {
  ref: string; // e.g. "BC-4821"
  clientId: string;
  product: Product;
  status: ApplicationStatus;
  /** Last completed flow step (for resume + stall detection). 0 = just started. */
  step: number;
  /** Form answers keyed by field id (see lib/data/products.ts). */
  details: Record<string, string>;
  documents: DocumentItem[];
  /**
   * When the client pressed "Send application". Undefined while the client
   * is still in the flow (a draft); drafts are what can stall.
   */
  submittedAt?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  applicationRef: string;
  /** Placeholder until real insurer partners are confirmed — never invent names. */
  insurer: string;
  coverType: string;
  premiumKes: number;
  excessKes?: number;
  benefits: string[];
  /** Set when the client picks this quote. */
  chosen?: boolean;
  createdAt: string;
}

export type MessageDirection = "in" | "out";
export type Channel = "email" | "whatsapp" | "sms";

export interface Message {
  id: string;
  applicationRef: string;
  direction: MessageDirection;
  channel: Channel;
  body: string;
  /** Inbound messages the admin hasn't opened yet surface in "Needs me now". */
  read: boolean;
  createdAt: string;
}
