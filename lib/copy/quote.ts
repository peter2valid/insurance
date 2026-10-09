/**
 * Instant motor quote: the form, the side-by-side comparison, and the
 * hand-off into the application. Prices come first; the phone number is
 * asked only once the client has picked an insurer.
 */
export const quote = {
  stepName: "getting a quote",

  form: {
    title: "Get your motor quote",
    description: "Takes about a minute. We'll show every insurer on our panel that covers your vehicle, priced side by side.",
    reassurance: "No phone number needed to see prices. Nothing is saved until you choose an insurer.",
    action: "Show my quotes",
    fields: {
      category: { label: "What is the vehicle used for?", hint: "This decides which insurers can cover it and how it's priced." },
      seats: { label: "Number of passenger seats", hint: "As on the logbook, for example 14" },
      tonnage: {
        label: "How much can it carry?",
        hint: "The carrying capacity on the logbook",
        options: [
          { value: "up_to_3", label: "Up to 3 tonnes", description: "Pick-ups and vans" },
          { value: "3_to_8", label: "3 to 8 tonnes", description: "Canters and light trucks" },
          { value: "8_to_20", label: "8 to 20 tonnes", description: "Medium and heavy trucks" },
          { value: "over_20", label: "Over 20 tonnes", description: "Trailers and prime movers" },
        ],
      },
      coverType: { label: "Type of cover" },
      make: { label: "Make", other: "Other make" },
      year: { label: "Year of manufacture" },
      value: { label: "Value of the vehicle", hint: "What it would sell for today. A close guess is fine — we check it with you before cover starts." },
      period: { label: "How long do you want cover for?" },
      startDate: { label: "When should cover start?", hint: "Today or any day in the next 60 days" },
    },
    errors: {
      category: "Choose what the vehicle is used for.",
      coverType: "Choose a type of cover.",
      make: "Choose the make of the vehicle.",
      year: "Choose the year of manufacture.",
      seats: "Enter the number of passenger seats, between 7 and 90.",
      tonnage: "Choose how much the vehicle can carry.",
      value: "Enter the value in shillings, between 50,000 and 50,000,000.",
      period: "Choose how long you want cover for.",
      startDate: "Choose a start date from today up to 60 days ahead.",
    },
  },

  compare: {
    pageTitle: "Compare quotes",
    title: (count: number) => (count === 1 ? "1 insurer covers your vehicle" : `${count} insurers cover your vehicle`),
    description: "Totals include levies and stamp duty. Choose one to carry on — you'll add your details and documents next.",
    editDetails: "Change details",
    summaryLabel: "Your quote is for",
    startsOn: (date: string) => `starts ${date}`,
    addonsHeading: "Add extras",
    addonsHint: "Optional. Prices update below.",
    perYear: "Total for 1 year",
    perMonth: "Total for 1 month",
    cheapest: "Lowest price",
    excess: (amount: string) => `Excess ${amount}: what you pay towards each claim`,
    breakdownToggle: "See how the price is made up",
    breakdown: {
      basic: "Basic premium",
      included: "Included",
      levies: "Levies and stamp duty",
    },
    choose: (insurer: string) => `Choose ${insurer}`,
    chosenToast: (insurer: string) => `${insurer} chosen`,
    nextNote: "Next: your phone number, logbook, ID and KRA PIN — about 3 minutes. You pay only after checking everything.",
    declinedHeading: "Not available for this vehicle",
    declined: (insurer: string, years: number) => `${insurer} covers vehicles up to ${years} years old comprehensively.`,
    showMore: (count: number) => (count === 1 ? "Show 1 more insurer" : `Show ${count} more insurers`),
    trackerNeeded: "Needs an approved tracking device at this value",
    goodToKnow: "Good to know",
    notes: {
      valuation: "After you pay, the insurer may book a free valuation of the vehicle.",
      thirdParty: "Third party cover doesn't pay to repair your own vehicle — only damage you cause to others.",
      psv: "We'll ask which Sacco or operator the vehicle runs with. Keep the PSV licence ready.",
      boda: "The rider needs a valid motorcycle driving licence for claims to be paid.",
      monthly: "Monthly cover ends after a month. We remind you before it does, so you're never off cover.",
      cartage: "This covers the truck, not the cargo. Goods in transit cover is separate — ask us.",
      carHire: "Keep a signed hire agreement for every customer: insurers ask for it with a claim.",
    },
    sampleNote: "Demo: prices come from sample rate cards, not the insurers' real rates. The final price is confirmed when we check your documents.",
    range: (low: string, high: string) => `From ${low} to ${high}.`,
    noClass: {
      title: "We'll find cover for this one for you",
      body: "None of our insurers prices this kind of vehicle online yet. Message us on WhatsApp — we'll get you quotes, usually the same day.",
      action: "Message us on WhatsApp",
      message: (summary: string) => `Hello, I'd like a motor quote for: ${summary}.`,
    },
    empty: {
      title: "No comprehensive cover for a vehicle this old",
      body: "The insurers on our panel cover older vehicles with third party cover. Or message us and we'll look for other options.",
      action: "See third party prices",
    },
    errors: {
      expired: "That quote can't be used any more. Get a fresh price below.",
    },
  },

  addons: {
    excess_protector: {
      label: "Excess protector",
      description: "You don't pay the excess when you claim.",
    },
    pvt: {
      label: "Political violence and terrorism",
      description: "Damage from riots, protests and strikes.",
    },
    loss_of_use: {
      label: "Courtesy car",
      description: "A hire car or daily cash for up to 10 days while yours is repaired.",
    },
    road_rescue: {
      label: "Road rescue",
      description: "24-hour towing and roadside help if you break down.",
    },
  },
  /** Loss of use for vehicles that earn money. */
  lossOfIncome: {
    label: "Loss of income",
    description: "Daily cash while the vehicle is off the road after a claim.",
  },
  addonsLabel: "Extras",
  seats: (count: string) => `${count} seats`,
  noAddons: "None",

  /** Shown on the phone screen once an insurer is chosen. */
  saved: (insurer: string, amount: string) =>
    `Your ${insurer} quote of ${amount} is saved. Enter your number to carry on — we'll text you a code.`,

  review: {
    section: "Your cover",
    insurer: "Insurer",
    total: "Total to pay",
    startDate: "Cover starts",
    action: "Send and go to payment",
    note: "You'll pay with M-Pesa on the next screen. We check your documents before we issue the cover.",
  },
} as const;
