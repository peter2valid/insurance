import { brand } from "@/lib/brand";
import { motorDocuments, productDocuments } from "./products";
import type { Application, Client, DocumentItem, DocumentStatus, Message, Product, Quote } from "./types";

/**
 * MOCK seed data: a realistic mix across all four admin buckets.
 * Times are relative to "now" so "12 min ago" stays true after every reset.
 *
 * Names, plates and amounts are invented. Phone and ID numbers use an
 * obviously fake range. Insurer names are placeholders — never invent
 * partnerships (CLAUDE.md §7).
 */

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

type Seed = {
  clients: Client[];
  applications: Application[];
  quotes: Quote[];
  messages: Message[];
};

type AppSeed = {
  num: number;
  name: string;
  idNumber: string;
  vehicle: { plate: string; make: string; model: string; year: string; chassis: string; body: string; valueKes: number };
  coverType?: string;
  step: number;
  status?: Application["status"];
  /** Minutes ago the client last did anything. */
  updatedAgo: number;
  /** Minutes ago the application was started. */
  createdAgo: number;
  submitted?: boolean;
  docs?: Partial<Record<DocumentItem["type"], DocumentStatus | { status: DocumentStatus; reason: string }>>;
};

const apps: AppSeed[] = [
  // Needs me now
  {
    num: 4821, name: "Wanjiku Kamau", idNumber: "29384756",
    vehicle: { plate: "KDA 123A", make: "Toyota", model: "Fielder", year: "2016", chassis: "NZE161-7054321", body: "Station wagon", valueKes: 1_450_000 },
    coverType: "comprehensive", step: 5, status: "received", updatedAgo: 4, createdAgo: 19, submitted: true,
    docs: { logbook: "uploaded", national_id: "uploaded", kra_pin: "uploaded" },
  },
  {
    num: 4817, name: "Otieno Odhiambo", idNumber: "31029485",
    vehicle: { plate: "KCZ 908K", make: "Mazda", model: "Demio", year: "2014", chassis: "DJ3FS-120944", body: "Hatchback", valueKes: 780_000 },
    step: 3, updatedAgo: 12, createdAgo: 18,
    docs: { logbook: "uploaded" },
  },
  {
    num: 4815, name: "Brian Mutua", idNumber: "27561839",
    vehicle: { plate: "KDC 552P", make: "Subaru", model: "Forester", year: "2015", chassis: "SJ5-061127", body: "SUV", valueKes: 1_900_000 },
    step: 2, updatedAgo: 47, createdAgo: 52,
  },
  {
    num: 4812, name: "Faith Njeri", idNumber: "33410298",
    vehicle: { plate: "KDB 210H", make: "Honda", model: "Fit", year: "2013", chassis: "GP1-1204583", body: "Hatchback", valueKes: 690_000 },
    coverType: "third_party_fire_theft", step: 5, status: "needs_info", updatedAgo: 6, createdAgo: 26 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "uploaded" },
  },
  {
    num: 4808, name: "Kevin Kiprotich", idNumber: "30192847",
    vehicle: { plate: "KCY 377T", make: "Nissan", model: "X-Trail", year: "2017", chassis: "NT32-055812", body: "SUV", valueKes: 2_350_000 },
    coverType: "comprehensive", step: 5, status: "documents_checked", updatedAgo: 38, createdAgo: 5 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified", driving_licence: "verified" },
  },
  {
    num: 4806, name: "Mercy Achieng", idNumber: "28475610",
    vehicle: { plate: "KDE 019B", make: "Toyota", model: "Axio", year: "2018", chassis: "NKE165-7189034", body: "Saloon", valueKes: 1_650_000 },
    coverType: "comprehensive", step: 5, status: "quotes_ready", updatedAgo: 9, createdAgo: 2 * DAY / MIN, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified" },
  },
  {
    num: 4803, name: "Hassan Abdi", idNumber: "25938471",
    vehicle: { plate: "KDA 845Q", make: "Toyota", model: "Probox", year: "2019", chassis: "NCP160-0098765", body: "Van", valueKes: 1_250_000 },
    coverType: "comprehensive", step: 5, status: "cover_chosen", updatedAgo: 21, createdAgo: 3 * DAY / MIN, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified" },
  },
  // Waiting on client
  {
    num: 4810, name: "Amina Hassan", idNumber: "32857164",
    vehicle: { plate: "KDB 441M", make: "Suzuki", model: "Swift", year: "2017", chassis: "ZC83S-102938", body: "Hatchback", valueKes: 950_000 },
    coverType: "comprehensive", step: 5, status: "needs_info", updatedAgo: 2 * 60, createdAgo: 6 * 60, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "needed" },
  },
  {
    num: 4823, name: "Grace Wambui", idNumber: "34019283",
    vehicle: { plate: "KDF 623C", make: "Volkswagen", model: "Polo", year: "2015", chassis: "6RZ-048271", body: "Hatchback", valueKes: 880_000 },
    step: 1, updatedAgo: 3, createdAgo: 4,
  },
  {
    num: 4800, name: "Peter Maina", idNumber: "26374819",
    vehicle: { plate: "KCX 118L", make: "Isuzu", model: "D-Max", year: "2016", chassis: "TFR86-7461203", body: "Pick-up", valueKes: 2_100_000 },
    coverType: "comprehensive", step: 5, status: "needs_info", updatedAgo: DAY / MIN, createdAgo: 2 * DAY / MIN, submitted: true,
    docs: {
      logbook: { status: "rejected", reason: "The photo is blurry. Take it again in good light." },
      national_id: "verified",
      kra_pin: "verified",
    },
  },
  // Quotes out
  {
    num: 4799, name: "Joyce Chebet", idNumber: "29918374",
    vehicle: { plate: "KDD 734F", make: "Mercedes-Benz", model: "C200", year: "2014", chassis: "W205-1A238471", body: "Saloon", valueKes: 2_800_000 },
    coverType: "comprehensive", step: 5, status: "quotes_ready", updatedAgo: 3 * 60, createdAgo: 2 * DAY / MIN, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified", driving_licence: "verified" },
  },
  // Done
  {
    num: 4790, name: "Daniel Omondi", idNumber: "24857391",
    vehicle: { plate: "KCW 902R", make: "Toyota", model: "Vitz", year: "2012", chassis: "KSP130-2104857", body: "Hatchback", valueKes: 620_000 },
    coverType: "third_party", step: 5, status: "covered", updatedAgo: 2 * DAY / MIN, createdAgo: 4 * DAY / MIN, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified" },
  },
  {
    num: 4785, name: "Lucy Nyambura", idNumber: "30485726",
    vehicle: { plate: "KDB 986G", make: "Toyota", model: "Harrier", year: "2016", chassis: "ZSU60-0071934", body: "SUV", valueKes: 3_400_000 },
    coverType: "comprehensive", step: 5, status: "covered", updatedAgo: 4 * DAY / MIN, createdAgo: 6 * DAY / MIN, submitted: true,
    docs: { logbook: "verified", national_id: "verified", kra_pin: "verified", driving_licence: "verified" },
  },
];

/** Health, travel and business applications (details as the flow saves them). */
type OtherSeed = {
  num: number;
  name: string;
  idNumber: string;
  product: Exclude<Product, "motor">;
  details: (days: (n: number) => string) => Record<string, string>;
  step: number;
  status?: Application["status"];
  updatedAgo: number;
  createdAgo: number;
  submitted?: boolean;
  docs?: Partial<Record<DocumentItem["type"], DocumentStatus>>;
  /** Premiums for the three placeholder insurers, when quotes exist. */
  quotes?: { coverType: string; premiums: [number, number, number]; benefits?: string[] };
};

const otherApps: OtherSeed[] = [
  // Needs me now: a new family health application
  {
    num: 4822, name: "Njeri Wambugu", idNumber: "31847265", product: "health",
    details: () => ({ who: "family", principalAge: "34", partnerAge: "36", childrenCount: "2", plan: "inpatient_outpatient", limit: "1000000", conditions: "no", conditionsNote: "" }),
    step: 4, status: "received", updatedAgo: 7, createdAgo: 16, submitted: true,
    docs: { national_id: "uploaded" },
  },
  // Needs me now: travel documents checked, ready for quotes
  {
    num: 4819, name: "Fatuma Ali", idNumber: "29571836", product: "travel",
    details: (days) => ({ region: "schengen", departDate: days(20), returnDate: days(34), travellers: "2", oldestAge: "41", purpose: "holiday" }),
    step: 4, status: "documents_checked", updatedAgo: 55, createdAgo: 4 * 60, submitted: true,
    docs: { passport: "verified" },
  },
  // Needs me now: stalled travel draft (stopped after choosing a destination)
  {
    num: 4816, name: "James Mwangi", idNumber: "33018472", product: "travel",
    details: () => ({ region: "uk" }),
    step: 1, updatedAgo: 25, createdAgo: 28,
  },
  // Waiting on client: business owes its KRA PIN
  {
    num: 4811, name: "Grace Akinyi", idNumber: "27493018", product: "business",
    details: () => ({ businessName: "Akinyi Fresh Mart", businessType: "retail", town: "Kondele, Kisumu", covers: "stock_contents,liability,employees", staffCount: "4", contentsValueKes: "1200000" }),
    step: 4, status: "needs_info", updatedAgo: 3 * 60, createdAgo: 26 * 60, submitted: true,
    docs: { business_registration: "verified", national_id: "verified", kra_pin: "needed" },
  },
  // Quotes out: health quotes waiting for the client to choose
  {
    num: 4814, name: "Samuel Kiptoo", idNumber: "24018375", product: "health",
    details: () => ({ who: "me", principalAge: "52", plan: "inpatient", limit: "2000000", conditions: "yes", conditionsNote: "High blood pressure, on treatment" }),
    step: 4, status: "quotes_ready", updatedAgo: 5 * 60, createdAgo: 2 * DAY / MIN, submitted: true,
    docs: { national_id: "verified" },
    quotes: { coverType: "inpatient", premiums: [65_300, 68_600, 61_400], benefits: ["Chronic condition cover after 12 months", "Day-care procedures"] },
  },
  // Done: covered business
  {
    num: 4795, name: "Ali Hassan", idNumber: "22847193", product: "business",
    details: () => ({ businessName: "Hassan Hardware", businessType: "retail", town: "Majengo, Mombasa", covers: "stock_contents,money", staffCount: "2", contentsValueKes: "2500000" }),
    step: 4, status: "covered", updatedAgo: 3 * DAY / MIN, createdAgo: 6 * DAY / MIN, submitted: true,
    docs: { business_registration: "verified", kra_pin: "verified", national_id: "verified" },
    quotes: { coverType: "package", premiums: [18_000, 18_900, 16_900], benefits: ["Burglary and fire", "Cash in safe up to KES 50,000"] },
  },
];

const PLACEHOLDER_INSURERS = ["[Insurer A]", "[Insurer B]", "[Insurer C]"];

/** Rough premium fixtures (KES). Illustrative only — not real rates. */
function quoteFixtures(ref: string, valueKes: number, at: string): Quote[] {
  const rates = [0.04, 0.042, 0.0375];
  return PLACEHOLDER_INSURERS.map((insurer, i) => ({
    id: `${ref}-q${i + 1}`,
    applicationRef: ref,
    insurer,
    coverType: "comprehensive",
    premiumKes: Math.round((valueKes * rates[i]) / 100) * 100,
    excessKes: [15_000, 20_000, 10_000][i],
    benefits: [
      ["Windscreen cover", "Towing up to KES 30,000", "Courtesy car 10 days"],
      ["Windscreen cover", "Political violence cover"],
      ["Windscreen cover", "Towing up to KES 20,000", "Entertainment system cover"],
    ][i],
    createdAt: at,
  }));
}

export function createSeed(now: number = Date.now()): Seed {
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * MIN).toISOString();
  const seed: Seed = { clients: [], applications: [], quotes: [], messages: [] };

  apps.forEach((a, index) => {
    const clientId = `client-${a.num}`;
    const ref = `${brand.refPrefix}-${a.num}`;
    seed.clients.push({
      id: clientId,
      name: a.name,
      phone: `+2547000001${String(index).padStart(2, "0")}`, // fake range
      idNumber: a.idNumber,
      createdAt: iso(a.createdAgo),
    });

    const details: Record<string, string> = {};
    if (a.step >= 2) details.plate = a.vehicle.plate;
    if (a.step >= 3) {
      Object.assign(details, {
        make: a.vehicle.make,
        model: a.vehicle.model,
        year: a.vehicle.year,
        chassisNumber: a.vehicle.chassis,
        bodyType: a.vehicle.body,
        ownerName: a.name,
      });
    }
    if (a.step >= 4) {
      Object.assign(details, {
        coverType: a.coverType ?? "comprehensive",
        usage: "private",
        vehicleValueKes: String(a.vehicle.valueKes),
      });
    }

    const documents: DocumentItem[] = motorDocuments.map((doc) => {
      const seeded = a.docs?.[doc.type];
      const status = typeof seeded === "object" ? seeded.status : (seeded ?? "needed");
      const hasFile = status !== "needed";
      return {
        id: `${ref}-${doc.type}`,
        type: doc.type,
        required: doc.required,
        status,
        ...(hasFile && {
          fileName: `${doc.type.replace("_", "-")}-${a.vehicle.plate.replace(" ", "")}.jpg`,
          uploadedAt: iso(a.updatedAgo + 1),
        }),
        ...(typeof seeded === "object" && { rejectionReason: seeded.reason }),
      };
    });

    seed.applications.push({
      ref,
      clientId,
      product: "motor",
      status: a.status ?? "received",
      step: a.step,
      details,
      documents,
      ...(a.submitted && { submittedAt: iso(a.status === "received" ? a.updatedAgo : a.createdAgo - 10) }),
      updatedAt: iso(a.updatedAgo),
      createdAt: iso(a.createdAgo),
    });

    if (a.status === "quotes_ready" || a.status === "cover_chosen" || a.status === "covered") {
      const quotes = quoteFixtures(ref, a.vehicle.valueKes, iso(a.updatedAgo + 30));
      if (a.status !== "quotes_ready") quotes[0].chosen = true;
      seed.quotes.push(...quotes);
    }
  });

  otherApps.forEach((a, i) => {
    const index = apps.length + i;
    const clientId = `client-${a.num}`;
    const ref = `${brand.refPrefix}-${a.num}`;
    // Dates relative to today, e.g. trip dates in the future.
    const days = (n: number) => new Date(now + n * DAY).toISOString().slice(0, 10);
    seed.clients.push({
      id: clientId,
      name: a.name,
      phone: `+2547000001${String(index).padStart(2, "0")}`, // fake range
      idNumber: a.idNumber,
      createdAt: iso(a.createdAgo),
    });
    const documents: DocumentItem[] = productDocuments[a.product].map((doc) => {
      const status = a.docs?.[doc.type] ?? "needed";
      return {
        id: `${ref}-${doc.type}`,
        type: doc.type,
        required: doc.required,
        status,
        ...(status !== "needed" && {
          fileName: `${doc.type.replace("_", "-")}-${a.num}.jpg`,
          uploadedAt: iso(a.updatedAgo + 1),
        }),
      };
    });
    seed.applications.push({
      ref,
      clientId,
      product: a.product,
      status: a.status ?? "received",
      step: a.step,
      details: a.details(days),
      documents,
      ...(a.submitted && { submittedAt: iso(a.status === "received" ? a.updatedAgo : a.createdAgo - 10) }),
      updatedAt: iso(a.updatedAgo),
      createdAt: iso(a.createdAgo),
    });
    if (a.quotes) {
      const { coverType, premiums, benefits = [] } = a.quotes;
      PLACEHOLDER_INSURERS.forEach((insurer, q) => {
        seed.quotes.push({
          id: `${ref}-q${q + 1}`,
          applicationRef: ref,
          insurer,
          coverType,
          premiumKes: premiums[q],
          benefits,
          chosen: a.status !== "quotes_ready" && q === 0,
          createdAt: iso(a.updatedAgo + 30),
        });
      });
    }
  });

  // Conversation snippets, including one unread reply (surfaces in "Needs me now").
  seed.messages.push(
    {
      id: "m-4806-1",
      applicationRef: `${brand.refPrefix}-4806`,
      direction: "out",
      channel: "whatsapp",
      body: "Hi Mercy, your quotes are ready. Choose your cover here.",
      read: true,
      createdAt: iso(60),
    },
    {
      id: "m-4806-2",
      applicationRef: `${brand.refPrefix}-4806`,
      direction: "in",
      channel: "whatsapp",
      body: "Thank you. Does the comprehensive one cover the windscreen?",
      read: false,
      createdAt: iso(9),
    },
    {
      id: "m-4810-1",
      applicationRef: `${brand.refPrefix}-4810`,
      direction: "out",
      channel: "whatsapp",
      body: "Hi Amina, we need your KRA PIN certificate to send your quotes.",
      read: true,
      createdAt: iso(120),
    },
  );

  return seed;
}
