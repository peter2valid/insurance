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
  | "cover_chosen" // client picked a quote; waiting for payment
  | "paid" // payment received; broker issues the cover
  | "covered";

export const applicationStatuses: readonly ApplicationStatus[] = [
  "received",
  "documents_checked",
  "preparing_quotes",
  "needs_info",
  "quotes_ready",
  "cover_chosen",
  "paid",
  "covered",
];

export type Product = "motor" | "health" | "travel" | "business";

export const products: readonly Product[] = ["motor", "health", "travel", "business"];

export function isProduct(value: unknown): value is Product {
  return typeof value === "string" && (products as readonly string[]).includes(value);
}

export type DocumentType =
  | "logbook"
  | "national_id"
  | "kra_pin"
  | "driving_licence"
  | "passport"
  | "business_registration"
  | "dependants_ids";

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
  /** The agent who referred this client, if any (commission on payment). */
  agentId?: string;
  /** Set when the cover is issued. Drives renewal reminders. */
  policy?: Policy;
  updatedAt: string;
  createdAt: string;
}

export interface Policy {
  insurer: string;
  coverType: string;
  premiumKes: number;
  /** Placeholder until the insurer issues the real number. */
  policyNumber: string;
  /** Digital certificate number (DMVIC for motor) — placeholder in the demo. */
  certificateNumber?: string;
  startsAt: string;
  endsAt: string;
}

export type PaymentStatus = "pending" | "paid" | "failed";

export interface Payment {
  id: string;
  applicationRef: string;
  amountKes: number;
  method: "mpesa";
  /** E.164 number the M-Pesa request went to. */
  phone: string;
  status: PaymentStatus;
  /** M-Pesa receipt, e.g. "SJK4H7Q2LM". SIMULATED in the demo. */
  receipt?: string;
  createdAt: string;
  paidAt?: string;
}

export type AgentStatus = "pending" | "active" | "paused";

export interface Agent {
  id: string;
  name: string;
  /** E.164 — also the agent's login (phone + code). */
  phone: string;
  email?: string;
  /** Short referral code used in links: /?agent=CODE */
  code: string;
  /** Percent of the premium (before levies) paid as commission. */
  commissionRate: number;
  status: AgentStatus;
  createdAt: string;
}

export type CommissionStatus = "pending" | "approved" | "paid";

export interface Commission {
  id: string;
  agentId: string;
  applicationRef: string;
  premiumKes: number;
  rate: number;
  amountKes: number;
  status: CommissionStatus;
  createdAt: string;
  paidAt?: string;
}

/** Broker-controlled switches for the automations (admin → Automations). */
export interface Settings {
  /** Send quotes from insurer rate cards the moment a motor application arrives. */
  autoQuote: boolean;
  /** Nudge clients who stop halfway. */
  nudgeStalled: boolean;
  /** Remind clients who haven't chosen a quote or paid. */
  remindQuotes: boolean;
  remindPayment: boolean;
  /** Remind clients before their cover ends. */
  renewalReminders: boolean;
  /** Default commission for new agents, in percent. */
  defaultCommissionRate: number;
  /** Insurer ids quoted to clients (lib/data/insurers.ts). */
  panel: string[];
}

export const defaultSettings: Settings = {
  autoQuote: true,
  nudgeStalled: true,
  remindQuotes: true,
  remindPayment: true,
  renewalReminders: true,
  defaultCommissionRate: 3,
  // The four insurers the broker named; more are switched on in Admin → Insurers.
  panel: ["britam", "pioneer", "liberty", "cannon"],
};

export interface Quote {
  id: string;
  applicationRef: string;
  /** Placeholder until real insurer partners are confirmed — never invent names. */
  insurer: string;
  coverType: string;
  /** Total the client pays: basic premium plus levies. */
  premiumKes: number;
  excessKes?: number;
  benefits: string[];
  /** How the total is made up (Kenyan statutory levies). */
  breakdown?: QuoteBreakdown;
  /** "annual" unless a monthly PSV cover. */
  period?: "annual" | "monthly";
  /** Set when the client picks this quote. */
  chosen?: boolean;
  createdAt: string;
}

export interface QuoteBreakdown {
  basicKes: number;
  /** Optional extras the client added (motor), priced before levies. */
  addons?: { id: string; kes: number; included?: boolean }[];
  trainingLevyKes: number;
  phcfKes: number;
  stampDutyKes: number;
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
