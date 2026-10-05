import { brand } from "@/lib/brand";
import { productDocuments } from "./products";
import { priceQuotes } from "./quote-provider";
import type {
  Agent,
  Application,
  Client,
  Commission,
  DocumentItem,
  DocumentStatus,
  Message,
  Payment,
  Product,
  Quote,
} from "./types";

/**
 * MOCK seed data: a realistic broker's day — private cars, matatus, taxis,
 * a boda boda, agents with commissions, payments and covers coming up for
 * renewal. Times are relative to "now" so "12 min ago" stays true.
 *
 * Names, plates and amounts are invented. Phone numbers use an obviously
 * fake range (+254 700 000 1xx clients, 2xx agents). Quotes come from the
 * SAMPLE rate cards in lib/data/insurers.ts.
 */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const D = DAY / MIN; // one day, in minutes

export type Seed = {
  clients: Client[];
  applications: Application[];
  quotes: Quote[];
  messages: Message[];
  agents: Agent[];
  payments: Payment[];
  commissions: Commission[];
};

type Vehicle = {
  category: string;
  plate: string;
  make: string;
  model: string;
  year: string;
  chassis: string;
  body: string;
  valueKes: number;
  seats?: string;
  period?: "annual" | "monthly";
};

type AppSeed = {
  num: number;
  name: string;
  email?: string;
  idNumber: string;
  product?: Product;
  vehicle?: Vehicle;
  /** Non-motor answers, as the flow saves them. */
  details?: (days: (n: number) => string) => Record<string, string>;
  coverType?: string;
  step: number;
  status?: Application["status"];
  /** Minutes ago the client last did anything. */
  updatedAgo: number;
  /** Minutes ago the application was started. */
  createdAgo: number;
  submitted?: boolean;
  agent?: string;
  docs?: Partial<Record<DocumentItem["type"], DocumentStatus | { status: DocumentStatus; reason: string }>>;
  /** Which quote (cheapest = 0) the client chose. */
  chose?: number;
  /** Cover start, in minutes ago (covered applications). */
  coverStartedAgo?: number;
  paymentPending?: boolean;
};

const allDocs = (status: DocumentStatus) => ({ logbook: status, national_id: status, kra_pin: status });

const apps: AppSeed[] = [
  // Needs me now
  {
    num: 4821, name: "Wanjiku Kamau", email: "wanjiku.kamau@example.com", idNumber: "29384756", agent: "agent-jane",
    vehicle: { category: "private", plate: "KDA 123A", make: "Toyota", model: "Fielder", year: "2016", chassis: "NZE161-7054321", body: "Station wagon", valueKes: 1_450_000 },
    coverType: "comprehensive", step: 5, status: "received", updatedAgo: 4, createdAgo: 19, submitted: true,
    docs: allDocs("uploaded"),
  },
  {
    num: 4804, name: "Joseph Kariuki", email: "jkariuki.sacco@example.com", idNumber: "23847561", agent: "agent-collins",
    vehicle: { category: "psv_matatu", plate: "KCU 456M", make: "Toyota", model: "Hiace", year: "2018", chassis: "KDH223-8012345", body: "Minibus", valueKes: 3_200_000, seats: "14", period: "annual" },
    coverType: "comprehensive", step: 5, status: "paid", updatedAgo: 14, createdAgo: 2 * D, submitted: true,
    docs: allDocs("verified"), chose: 0,
  },
  {
    num: 4817, name: "Otieno Odhiambo", idNumber: "31029485",
    vehicle: { category: "private", plate: "KCZ 908K", make: "Mazda", model: "Demio", year: "2014", chassis: "DJ3FS-120944", body: "Hatchback", valueKes: 780_000 },
    step: 3, updatedAgo: 72, createdAgo: 80,
    docs: { logbook: "uploaded" },
  },
  {
    num: 4815, name: "Brian Mutua", idNumber: "27561839",
    vehicle: { category: "psv_taxi", plate: "KDC 552P", make: "Toyota", model: "Axio", year: "2017", chassis: "NKE165-7061127", body: "Saloon", valueKes: 1_300_000 },
    step: 2, updatedAgo: 47, createdAgo: 52,
  },
  {
    num: 4812, name: "Faith Njeri", email: "faith.njeri@example.com", idNumber: "33410298",
    vehicle: { category: "private", plate: "KDB 210H", make: "Honda", model: "Fit", year: "2013", chassis: "GP1-1204583", body: "Hatchback", valueKes: 690_000 },
    coverType: "third_party_fire_theft", step: 5, status: "needs_info", updatedAgo: 6, createdAgo: 26 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "uploaded" },
  },
  {
    num: 4808, name: "Kevin Kiprotich", idNumber: "30192847",
    vehicle: { category: "commercial", plate: "KCY 377T", make: "Isuzu", model: "NKR", year: "2017", chassis: "NKR77-7055812", body: "Lorry", valueKes: 2_350_000 },
    coverType: "comprehensive", step: 5, status: "documents_checked", updatedAgo: 38, createdAgo: 5 * 60, submitted: true,
    docs: allDocs("verified"),
  },
  // Quotes out / awaiting payment
  {
    num: 4806, name: "Mercy Achieng", email: "mercy.achieng@example.com", idNumber: "28475610",
    vehicle: { category: "private", plate: "KDE 019B", make: "Toyota", model: "Axio", year: "2018", chassis: "NKE165-7189034", body: "Saloon", valueKes: 1_650_000 },
    coverType: "comprehensive", step: 5, status: "quotes_ready", updatedAgo: 9, createdAgo: 2 * D, submitted: true,
    docs: allDocs("verified"),
  },
  {
    num: 4803, name: "Hassan Abdi", idNumber: "25938471",
    vehicle: { category: "commercial", plate: "KDA 845Q", make: "Toyota", model: "Probox", year: "2019", chassis: "NCP160-0098765", body: "Van", valueKes: 1_250_000 },
    coverType: "comprehensive", step: 5, status: "cover_chosen", updatedAgo: 3 * 60, createdAgo: 3 * D, submitted: true,
    docs: allDocs("verified"), chose: 0, paymentPending: true,
  },
  {
    num: 4802, name: "Ibrahim Wekesa", idNumber: "35129847", agent: "agent-collins",
    vehicle: { category: "motorcycle", plate: "KMEX 123A", make: "TVS", model: "Star HLX 125", year: "2022", chassis: "MD625KF5-1N123456", body: "Motorcycle", valueKes: 140_000, period: "monthly" },
    coverType: "third_party", step: 5, status: "quotes_ready", updatedAgo: 5 * 60, createdAgo: 7 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "uploaded" },
  },
  {
    num: 4799, name: "Joyce Chebet", email: "joyce.chebet@example.com", idNumber: "29918374",
    vehicle: { category: "private", plate: "KDD 734F", make: "Mercedes-Benz", model: "C200", year: "2014", chassis: "W205-1A238471", body: "Saloon", valueKes: 2_800_000 },
    coverType: "comprehensive", step: 5, status: "quotes_ready", updatedAgo: 26 * 60, createdAgo: 2 * D, submitted: true,
    docs: allDocs("verified"),
  },
  // Waiting on client
  {
    num: 4810, name: "Amina Hassan", idNumber: "32857164",
    vehicle: { category: "psv_taxi", plate: "KDB 441M", make: "Suzuki", model: "Swift", year: "2017", chassis: "ZC83S-102938", body: "Hatchback", valueKes: 950_000 },
    coverType: "comprehensive", step: 5, status: "needs_info", updatedAgo: 2 * 60, createdAgo: 6 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "needed" },
  },
  {
    num: 4823, name: "Grace Wambui", idNumber: "34019283",
    vehicle: { category: "private", plate: "KDF 623C", make: "Volkswagen", model: "Polo", year: "2015", chassis: "6RZ-048271", body: "Hatchback", valueKes: 880_000 },
    step: 1, updatedAgo: 3, createdAgo: 4,
  },
  {
    num: 4800, name: "Peter Maina", idNumber: "26374819",
    vehicle: { category: "commercial", plate: "KCX 118L", make: "Isuzu", model: "D-Max", year: "2016", chassis: "TFR86-7461203", body: "Pick-up", valueKes: 2_100_000 },
    coverType: "comprehensive", step: 5, status: "needs_info", updatedAgo: D, createdAgo: 2 * D, submitted: true,
    docs: {
      logbook: { status: "rejected", reason: "The photo is blurry. Take it again in good light." },
      national_id: "verified",
      kra_pin: "verified",
    },
  },
  // Done — covered, some coming up for renewal
  {
    num: 4790, name: "Daniel Omondi", email: "daniel.omondi@example.com", idNumber: "24857391",
    vehicle: { category: "private", plate: "KCW 902R", make: "Toyota", model: "Vitz", year: "2012", chassis: "KSP130-2104857", body: "Hatchback", valueKes: 620_000 },
    coverType: "third_party", step: 5, status: "covered", updatedAgo: 353 * D, createdAgo: 355 * D, submitted: true,
    docs: allDocs("verified"), chose: 0, coverStartedAgo: 353 * D,
  },
  {
    num: 4776, name: "Paul Mwangi", idNumber: "21938475", agent: "agent-collins",
    vehicle: { category: "psv_matatu", plate: "KBZ 771J", make: "Isuzu", model: "FRR bus", year: "2015", chassis: "FRR90-7004512", body: "Bus", valueKes: 4_800_000, seats: "33", period: "annual" },
    coverType: "third_party", step: 5, status: "covered", updatedAgo: 359 * D, createdAgo: 361 * D, submitted: true,
    docs: allDocs("verified"), chose: 0, coverStartedAgo: 359 * D,
  },
  {
    num: 4780, name: "Samuel Njoroge", email: "samuel.njoroge@example.com", idNumber: "28374651", agent: "agent-jane",
    vehicle: { category: "psv_taxi", plate: "KDG 310X", make: "Toyota", model: "Axio Hybrid", year: "2019", chassis: "NKE165-8023341", body: "Saloon", valueKes: 1_750_000 },
    coverType: "comprehensive", step: 5, status: "covered", updatedAgo: 338 * D, createdAgo: 340 * D, submitted: true,
    docs: allDocs("verified"), chose: 1, coverStartedAgo: 338 * D,
  },
  {
    num: 4785, name: "Lucy Nyambura", email: "lucy.nyambura@example.com", idNumber: "30485726",
    vehicle: { category: "private", plate: "KDB 986G", make: "Toyota", model: "Harrier", year: "2016", chassis: "ZSU60-0071934", body: "SUV", valueKes: 3_400_000 },
    coverType: "comprehensive", step: 5, status: "covered", updatedAgo: 4 * D, createdAgo: 6 * D, submitted: true,
    docs: allDocs("verified"), chose: 0, coverStartedAgo: 4 * D,
  },
  // Health, travel and business
  {
    num: 4822, name: "Njeri Wambugu", idNumber: "31847265", product: "health",
    details: () => ({ who: "family", principalAge: "34", partnerAge: "36", childrenCount: "2", plan: "inpatient_outpatient", limit: "1000000", conditions: "no", conditionsNote: "" }),
    step: 4, status: "received", updatedAgo: 7, createdAgo: 16, submitted: true,
    docs: { national_id: "uploaded" },
  },
  {
    num: 4819, name: "Fatuma Ali", idNumber: "29571836", product: "travel",
    details: (days) => ({ region: "schengen", departDate: days(20), returnDate: days(34), travellers: "2", oldestAge: "41", purpose: "holiday" }),
    step: 4, status: "documents_checked", updatedAgo: 55, createdAgo: 4 * 60, submitted: true,
    docs: { passport: "verified" },
  },
  {
    num: 4816, name: "James Mwangi", idNumber: "33018472", product: "travel",
    details: () => ({ region: "uk" }),
    step: 1, updatedAgo: 25, createdAgo: 28,
  },
  {
    num: 4811, name: "Grace Akinyi", idNumber: "27493018", product: "business",
    details: () => ({ businessName: "Akinyi Fresh Mart", businessType: "retail", town: "Kondele, Kisumu", covers: "stock_contents,liability,employees", staffCount: "4", contentsValueKes: "1200000" }),
    step: 4, status: "needs_info", updatedAgo: 3 * 60, createdAgo: 26 * 60, submitted: true,
    docs: { business_registration: "verified", national_id: "verified", kra_pin: "needed" },
  },
  {
    num: 4814, name: "Samuel Kiptoo", idNumber: "24018375", product: "health",
    details: () => ({ who: "me", principalAge: "52", plan: "inpatient", limit: "2000000", conditions: "yes", conditionsNote: "High blood pressure, on treatment" }),
    step: 4, status: "quotes_ready", updatedAgo: 5 * 60, createdAgo: 2 * D, submitted: true,
    docs: { national_id: "verified" },
  },
  {
    num: 4795, name: "Ali Hassan", idNumber: "22847193", product: "business",
    details: () => ({ businessName: "Hassan Hardware", businessType: "retail", town: "Majengo, Mombasa", covers: "stock_contents,money", staffCount: "2", contentsValueKes: "2500000" }),
    step: 4, status: "covered", updatedAgo: 3 * D, createdAgo: 6 * D, submitted: true,
    docs: { business_registration: "verified", kra_pin: "verified", national_id: "verified" },
    chose: 0, coverStartedAgo: 3 * D,
  },
];

const agents: (Omit<Agent, "createdAt"> & { createdAgo: number })[] = [
  { id: "agent-jane", name: "Jane Wairimu", phone: "+254700000201", email: "jane.wairimu@example.com", code: "JANE", commissionRate: 3, status: "active", createdAgo: 400 * D },
  { id: "agent-collins", name: "Collins Otieno", phone: "+254700000202", email: "collins.otieno@example.com", code: "COLLINS", commissionRate: 3.5, status: "active", createdAgo: 380 * D },
  { id: "agent-mary", name: "Mary Atieno", phone: "+254700000203", code: "MARY", commissionRate: 3, status: "pending", createdAgo: 2 * 60 },
];

/** Fake but realistic-looking M-Pesa receipt (SIMULATED), stable per application. */
function receipt(num: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let seed = (num * 7919) % 2147483647;
  let code = "SK";
  for (let i = 0; i < 8; i++) {
    seed = (seed * 48271) % 2147483647; // Park–Miller: stays within safe integers
    code += chars[seed % chars.length];
  }
  return code;
}

export function createSeed(now: number = Date.now()): Seed {
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * MIN).toISOString();
  const days = (n: number) => new Date(now + n * DAY).toISOString().slice(0, 10);
  const seed: Seed = { clients: [], applications: [], quotes: [], messages: [], agents: [], payments: [], commissions: [] };

  for (const a of agents) {
    const { createdAgo, ...agent } = a;
    seed.agents.push({ ...agent, createdAt: iso(createdAgo) });
  }

  apps.forEach((a, index) => {
    const product = a.product ?? "motor";
    const clientId = `client-${a.num}`;
    const ref = `${brand.refPrefix}-${a.num}`;
    seed.clients.push({
      id: clientId,
      name: a.name,
      phone: `+2547000001${String(index).padStart(2, "0")}`, // fake range
      email: a.email,
      idNumber: a.idNumber,
      createdAt: iso(a.createdAgo),
    });

    let details: Record<string, string> = {};
    if (product === "motor" && a.vehicle) {
      const v = a.vehicle;
      if (a.step >= 2) {
        details = { category: v.category, plate: v.plate };
        if (v.seats) details.seats = v.seats;
        if (v.period) details.period = v.period;
      }
      if (a.step >= 3) {
        Object.assign(details, {
          make: v.make, model: v.model, year: v.year, chassisNumber: v.chassis, bodyType: v.body, ownerName: a.name, vehicleConfirmed: "yes",
        });
      }
      if (a.step >= 4) {
        Object.assign(details, { coverType: a.coverType ?? "comprehensive" });
        if (a.coverType !== "third_party") details.vehicleValueKes = String(v.valueKes);
      }
    } else if (a.details) {
      details = a.details(days);
    }

    const documents: DocumentItem[] = productDocuments[product].map((doc) => {
      const seeded = a.docs?.[doc.type];
      const status = typeof seeded === "object" ? seeded.status : (seeded ?? "needed");
      const hasFile = status !== "needed";
      return {
        id: `${ref}-${doc.type}`,
        type: doc.type,
        required: doc.required,
        status,
        ...(hasFile && {
          fileName: `${doc.type.replace("_", "-")}-${a.num}.jpg`,
          uploadedAt: iso(a.updatedAgo + 1),
        }),
        ...(typeof seeded === "object" && { rejectionReason: seeded.reason }),
      };
    });

    const application: Application = {
      ref,
      clientId,
      product,
      status: a.status ?? "received",
      step: a.step,
      details,
      documents,
      ...(a.agent && { agentId: a.agent }),
      ...(a.submitted && { submittedAt: iso(a.status === "received" ? a.updatedAgo : a.createdAgo - 10) }),
      updatedAt: iso(a.updatedAgo),
      createdAt: iso(a.createdAgo),
    };

    const withQuotes = ["quotes_ready", "cover_chosen", "paid", "covered"].includes(application.status);
    if (withQuotes) {
      const drafts = priceQuotes(application);
      drafts.forEach((draft, q) => {
        seed.quotes.push({
          ...draft,
          id: `${ref}-q${q + 1}`,
          applicationRef: ref,
          chosen: a.chose === q,
          createdAt: iso(Math.min(a.updatedAgo + 30, a.createdAgo - 5)),
        });
      });

      const chosen = a.chose !== undefined ? drafts[a.chose] : undefined;
      if (chosen) {
        const paidAgo = a.coverStartedAgo !== undefined ? a.coverStartedAgo + 60 : a.updatedAgo;
        const payment: Payment = {
          id: `pay-${a.num}`,
          applicationRef: ref,
          amountKes: chosen.premiumKes,
          method: "mpesa",
          phone: seed.clients[index].phone,
          status: a.paymentPending ? "pending" : "paid",
          ...(!a.paymentPending && { receipt: receipt(a.num), paidAt: iso(paidAgo) }),
          createdAt: iso(paidAgo + 2),
        };
        seed.payments.push(payment);

        if (a.coverStartedAgo !== undefined) {
          const starts = new Date(now - a.coverStartedAgo * MIN);
          const ends = new Date(starts);
          if (chosen.period === "monthly") ends.setMonth(ends.getMonth() + 1);
          else ends.setFullYear(ends.getFullYear() + 1);
          ends.setDate(ends.getDate() - 1);
          application.policy = {
            insurer: chosen.insurer,
            coverType: chosen.coverType,
            premiumKes: chosen.premiumKes,
            policyNumber: `[Policy no. ${a.num}]`,
            certificateNumber: product === "motor" ? `[Certificate no. ${a.num}]` : undefined,
            startsAt: starts.toISOString(),
            endsAt: ends.toISOString(),
          };
        }

        const agent = seed.agents.find((item) => item.id === a.agent);
        if (agent && payment.status === "paid") {
          const basic = chosen.breakdown?.basicKes ?? chosen.premiumKes;
          seed.commissions.push({
            id: `com-${a.num}`,
            agentId: agent.id,
            applicationRef: ref,
            premiumKes: basic,
            rate: agent.commissionRate,
            amountKes: Math.round((basic * agent.commissionRate) / 100),
            // Older covers have been paid out; this week's are still owed.
            status: (a.coverStartedAgo ?? 0) > 30 * D ? "paid" : "pending",
            createdAt: iso(paidAgo),
            ...((a.coverStartedAgo ?? 0) > 30 * D && { paidAt: iso(paidAgo - 7 * D) }),
          });
        }
      }
    }

    seed.applications.push(application);
  });

  // Conversation snippets, including one unread reply (surfaces in "Needs me now").
  seed.messages.push(
    {
      id: "m-4806-1",
      applicationRef: `${brand.refPrefix}-4806`,
      direction: "out",
      channel: "whatsapp",
      body: "Hi Mercy, your quotes are ready. Compare 4 insurers and choose your cover.",
      read: true,
      createdAt: iso(60),
    },
    {
      id: "m-4806-2",
      applicationRef: `${brand.refPrefix}-4806`,
      direction: "in",
      channel: "whatsapp",
      body: "Thank you. Does the Britam one cover the windscreen?",
      read: false,
      createdAt: iso(9),
    },
    {
      id: "m-4810-1",
      applicationRef: `${brand.refPrefix}-4810`,
      direction: "out",
      channel: "whatsapp",
      body: "Hi Amina, we need your KRA PIN certificate to finish your application.",
      read: true,
      createdAt: iso(120),
    },
  );

  return seed;
}
