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
      category: { label: "What is the vehicle used for?" },
      seats: { label: "Number of passenger seats", hint: "As on the logbook, for example 14" },
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
    sampleNote: "Demo: prices come from sample rate cards, not the insurers' real rates. The final price is confirmed when we check your documents.",
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
      description: "You don't pay the excess when you make a claim.",
    },
    pvt: {
      label: "Political violence and terrorism",
      description: "Covers damage from riots, protests and strikes.",
    },
  },
  addonsLabel: "Extras",
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
