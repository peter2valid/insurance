import type { Product } from "@/lib/data/types";

/**
 * Strings for each product: names, cover types, and the questions asked in
 * the flow. Question structure lives in lib/flow/questions.ts; every word
 * the client reads lives here (CLAUDE.md §7).
 */

export const productNames: Record<Product, string> = {
  motor: "Motor",
  health: "Health",
  travel: "Travel",
  business: "Business",
};

/** Lower-case, mid-sentence: "New health application". */
export const productNamesInline: Record<Product, string> = {
  motor: "motor",
  health: "health",
  travel: "travel",
  business: "business",
};

/** Cover types a quote can be for. */
export const coverLabels: Record<string, string> = {
  // motor
  comprehensive: "Comprehensive",
  third_party_fire_theft: "Third party, fire and theft",
  third_party: "Third party only",
  // health
  inpatient: "Inpatient only",
  inpatient_outpatient: "Inpatient and outpatient",
  full: "Inpatient, outpatient and maternity",
  // travel
  standard: "Standard travel cover",
  plus: "Travel cover with higher limits",
  // business
  package: "Business package",
  liability: "Public liability only",
};

export const questionErrors = {
  required: (label: string) => `Enter ${label.toLowerCase()}.`,
  choose: (label: string) => `Choose ${label.toLowerCase()}.`,
  chooseAtLeastOne: "Choose at least one thing to cover.",
  number: (min: number, max: number) => `Enter a number between ${min} and ${max}.`,
  money: (min: string, max: string) => `Enter an amount between ${min} and ${max}.`,
  date: "Enter a date, for example 12/10/2026.",
  dateFuture: "Choose a date from today onwards.",
  returnAfterDeparture: "Your return date must be after you leave.",
  tripTooLong: "Trips over a year need a different kind of cover. Message us on WhatsApp.",
};

/** How a vehicle is used (motor). */
export const vehicleCategoryLabels: Record<string, string> = {
  private: "Private car",
  commercial: "Commercial — goods",
  psv_matatu: "PSV — matatu or bus",
  psv_taxi: "PSV — taxi or ride-hailing",
  motorcycle: "Boda boda / motorcycle",
  tuktuk: "Tuk-tuk",
};

export const periodLabels: Record<string, string> = {
  annual: "1 year",
  monthly: "1 month",
};

export const questions = {
  // Motor
  category: {
    title: "What do you use the vehicle for?",
    description: "Insurers price private cars, matatus, taxis and boda bodas differently.",
    stepName: "vehicle use",
    fields: {
      category: {
        label: "Vehicle use",
        options: [
          { value: "private", label: "Private car", description: "Personal and family use" },
          { value: "commercial", label: "Commercial — goods", description: "Pick-up, van or lorry carrying goods" },
          { value: "psv_matatu", label: "PSV — matatu or bus", description: "Carries fare-paying passengers" },
          { value: "psv_taxi", label: "PSV — taxi or ride-hailing", description: "Uber, Bolt, Little or a taxi" },
          { value: "motorcycle", label: "Boda boda / motorcycle" },
          { value: "tuktuk", label: "Tuk-tuk" },
        ],
      },
      seats: { label: "Number of passenger seats", hint: "As on the logbook, for example 14" },
      period: {
        label: "How long do you want cover for?",
        options: [
          { value: "annual", label: "1 year", description: "Best value" },
          { value: "monthly", label: "1 month", description: "Pay as you go — popular with matatus and boda bodas" },
        ],
      },
    },
  },
  kra: {
    title: "Upload your KRA PIN certificate",
    description: "A photo or the PDF from iTax is fine.",
    label: "KRA PIN certificate",
    reassurance: "Only our team and the insurer see it. Insurers need a KRA PIN to issue cover.",
    later: "I'll upload it later",
    toast: "KRA PIN uploaded",
    stepName: "KRA PIN upload",
  },
  // Health
  who: {
    title: "Who do you want to cover?",
    description: "You can add or remove people later.",
    stepName: "who to cover",
    fields: {
      who: {
        label: "People to cover",
        options: [
          { value: "me", label: "Just me" },
          { value: "me_partner", label: "Me and my partner" },
          { value: "family", label: "My family", description: "Me, my partner and our children" },
          { value: "children", label: "My children only" },
        ],
      },
    },
  },
  ages: {
    title: "How old is everyone?",
    description: "Age changes the price more than anything else.",
    stepName: "ages",
    fields: {
      principalAge: { label: "Your age" },
      partnerAge: { label: "Your partner's age" },
      childrenCount: { label: "Number of children", hint: "Children up to 24 years old" },
    },
  },
  plan: {
    title: "What should it cover?",
    description: "Inpatient means hospital stays. Outpatient covers doctor visits and medicine.",
    stepName: "type of plan",
    fields: {
      plan: {
        label: "Type of plan",
        options: [
          { value: "inpatient", label: "Inpatient only", description: "Hospital stays and surgery. The lowest price." },
          {
            value: "inpatient_outpatient",
            label: "Inpatient and outpatient",
            description: "Adds doctor visits, tests and prescribed medicine.",
          },
          {
            value: "full",
            label: "Inpatient, outpatient and maternity",
            description: "Adds pregnancy and childbirth.",
          },
        ],
      },
    },
  },
  limit: {
    title: "How much hospital cover?",
    description: "The most the insurer pays for hospital bills in a year. Not sure? KES 1,000,000 suits most families.",
    stepName: "cover limit",
    fields: {
      limit: {
        label: "Yearly hospital limit",
        options: [
          { value: "500000", label: "KES 500,000" },
          { value: "1000000", label: "KES 1,000,000" },
          { value: "2000000", label: "KES 2,000,000" },
          { value: "5000000", label: "KES 5,000,000" },
        ],
      },
    },
  },
  conditions: {
    title: "Is anyone being treated for a condition now?",
    description: "For example diabetes, high blood pressure or asthma. Insurers need to know; it rarely stops cover.",
    reassurance: "Only our team and the insurer see this. It's used only to get you accurate quotes.",
    stepName: "health conditions",
    fields: {
      conditions: {
        label: "Current conditions",
        options: [
          { value: "no", label: "No" },
          { value: "yes", label: "Yes" },
        ],
      },
      conditionsNote: { label: "What condition, and who has it?", hint: "A few words is enough" },
    },
  },

  // Travel
  destination: {
    title: "Where are you going?",
    description: "Pick the furthest place you'll visit.",
    stepName: "destination",
    fields: {
      region: {
        label: "Destination",
        options: [
          { value: "schengen", label: "Europe (Schengen countries)" },
          { value: "uk", label: "United Kingdom" },
          { value: "usa_canada", label: "USA or Canada" },
          { value: "africa", label: "Africa" },
          { value: "asia", label: "Asia" },
          { value: "middle_east", label: "Middle East" },
          { value: "worldwide", label: "Several regions / worldwide" },
        ],
      },
    },
  },
  dates: {
    title: "When are you travelling?",
    description: "Cover starts the day you leave.",
    stepName: "travel dates",
    fields: {
      departDate: { label: "Leaving on" },
      returnDate: { label: "Coming back on" },
    },
  },
  travellers: {
    title: "Who's travelling?",
    description: "Include yourself.",
    stepName: "travellers",
    fields: {
      travellers: { label: "Number of travellers" },
      oldestAge: { label: "Age of the oldest traveller", hint: "Prices go up for travellers over 65" },
    },
  },
  purpose: {
    title: "What's the trip for?",
    description: "Some visas need a specific kind of cover — we'll check that for you.",
    stepName: "purpose of trip",
    fields: {
      purpose: {
        label: "Purpose",
        options: [
          { value: "holiday", label: "Holiday" },
          { value: "business", label: "Business" },
          { value: "study", label: "Study" },
          { value: "family", label: "Visiting family or friends" },
        ],
      },
    },
  },

  // Business
  business: {
    title: "Tell us about your business",
    description: "So we can find insurers who cover businesses like yours.",
    stepName: "business details",
    fields: {
      businessName: { label: "Business name" },
      businessType: {
        label: "Type of business",
        options: [
          { value: "retail", label: "Shop or retail" },
          { value: "food", label: "Restaurant, café or food" },
          { value: "office", label: "Office or professional services" },
          { value: "salon", label: "Salon or barber" },
          { value: "pharmacy", label: "Pharmacy or clinic" },
          { value: "workshop", label: "Workshop or small factory" },
          { value: "other", label: "Something else" },
        ],
      },
      town: { label: "Town or area", hint: "For example Westlands, Nairobi" },
    },
  },
  covers: {
    title: "What do you want to cover?",
    description: "Choose everything that applies. We'll explain what each quote includes.",
    stepName: "what to cover",
    fields: {
      covers: {
        label: "Things to cover",
        options: [
          { value: "stock_contents", label: "Stock and contents", description: "Goods, furniture and equipment" },
          { value: "building", label: "The building", description: "Only if you own it" },
          { value: "liability", label: "Public liability", description: "If a customer is hurt or their property damaged" },
          { value: "money", label: "Cash", description: "Money on the premises or on the way to the bank" },
          { value: "employees", label: "Staff injuries (WIBA)", description: "Required by law if you employ people" },
          { value: "transit", label: "Goods in transit", description: "Stock while it's being delivered" },
        ],
      },
    },
  },
  size: {
    title: "How big is the business?",
    description: "Rough figures are fine.",
    stepName: "business size",
    fields: {
      staffCount: { label: "Number of staff", hint: "Not counting yourself. Enter 0 if it's just you." },
      contentsValueKes: { label: "Value of stock, contents and building", hint: "For example 800,000" },
    },
  },

  // Uploads for new products
  passport: {
    title: "Upload your passport",
    description: "A photo of the page with your photo is enough.",
    label: "Photo of your passport",
    reassurance: "Only our team and the insurer see your passport. It's stored securely and used only for this cover.",
    later: "I'll upload it later",
    toast: "Passport uploaded",
    stepName: "passport upload",
  },
  registration: {
    title: "Upload your business registration",
    description: "Your certificate of registration or incorporation.",
    label: "Business registration certificate",
    reassurance: "Only our team and the insurer see this. It's stored securely and used only for this cover.",
    later: "I'll upload it later",
    toast: "Registration certificate uploaded",
    stepName: "registration upload",
  },
} as const;

/** "Your full name" question wording differs a little by product. */
export const nameDescriptions: Record<Product, string> = {
  motor: "As it appears on your national ID.",
  health: "The main person on the cover, as it appears on your national ID.",
  travel: "As it appears on your passport.",
  business: "The person we should talk to about this cover.",
};

/** What to have ready, per product, shown on the hero. */
export const productBlurbs: Record<Product, string> = {
  motor: "Private cars, matatus, taxis and boda bodas",
  health: "You, your partner or your whole family",
  travel: "Medical and trip cover for any destination",
  business: "Stock, premises, liability and staff",
};

export const productCta: Record<Product, string> = {
  motor: "Start with motor",
  health: "Start with health",
  travel: "Start with travel",
  business: "Start with business",
};

/** One-line summaries ("Health · 3 people · Inpatient and outpatient"). */
export const summaries = {
  people: (count: number) => (count === 1 ? "1 person" : `${count} people`),
  travellers: (count: number) => (count === 1 ? "1 traveller" : `${count} travellers`),
  staff: (count: number) => (count === 1 ? "1 staff member" : `${count} staff`),
  dateRange: (from: string, to: string) => `${from} – ${to}`,
  noDetails: "Details not given yet",
};
