/**
 * Client application flow strings (CLAUDE.md §8.1).
 * Buttons say exactly what happens; the matching toast uses the same words.
 */
export const flow = {
  help: "Need help?",
  helpMessage: (step: string) => `Hello, I need help with my application. I'm on: ${step}.`,
  helpMessageWithRef: (ref: string, step: string) =>
    `Hello, I need help with my application ${ref}. I'm on: ${step}.`,
  change: "Change",
  background: {
    uploading: (doc: string) => `Uploading your ${doc}`,
    started: "Uploading in the background. Carry on.",
    retry: "Try again",
    dismiss: "Dismiss",
  },
  continue: "Continue",
  /** The five steps of each journey, as the step tracker names them. */
  journeySteps: {
    motor: ["Quote", "Your details", "Vehicle", "Documents", "Confirm & pay"],
    health: ["Your details", "Who's covered", "Cover", "Health & ID", "Send"],
    travel: ["Your details", "Trip", "Travellers", "Passport", "Send"],
    business: ["Your details", "Business", "Cover", "Documents", "Send"],
  },
  saving: "Saving",

  loadError: {
    title: "We couldn't load this step",
    body: "Check your internet connection, then try again. Your answers so far are saved.",
    action: "Try again",
  },

  errors: {
    generic: "Something went wrong on our side. Try again, or message us on WhatsApp.",
    network: "We couldn't reach our server. Check your internet connection and try again.",
    notYours:
      "This application opens on the phone that started it, or from the link we sent you on WhatsApp or email. Open that link, or start a new application.",
  },

  phone: {
    title: "Your details",
    description: "So we can send your quotes, receipt and policy. No password, no code.",
    nameHint: "As it appears on your national ID",
    label: "WhatsApp number",
    hint: "We send updates here. For example 712 345 678",
    reassurance: "We only use your details for this application and to keep you updated. Only our team sees them.",
    action: "Continue",
    errors: {
      required: "Enter your phone number to continue.",
      invalid: "That doesn't look like a Kenyan mobile number. Check it starts with 7 or 1 and has 9 digits.",
    },
    toast: "Details saved",
  },

  vehicle: {
    title: "What's your number plate?",
    description: "We'll use it to find your car's details.",
    label: "Number plate",
    hint: "For example KDA 123A",
    action: "Continue",
    snapInstead: "Snap the logbook instead",
    errors: {
      required: "Enter your number plate, or snap your logbook instead.",
      invalid: "That doesn't look like a Kenyan number plate. Check it looks like KDA 123A.",
    },
  },

  logbook: {
    title: "Snap your logbook",
    description: "One photo fills in your vehicle's details for you — no typing. Take it of the page with the registration details.",
    label: "Photo of your logbook",
    reassurance: "Only our team sees your documents. They're stored securely and used only for this application.",
    takePhoto: "Take a photo",
    chooseFile: "Choose a file",
    reading: "Reading your logbook",
    readingBody: "This takes a few seconds.",
    later: "Type the details instead",
    errors: {
      unreadable: "We couldn't read that photo. Take it again in good light, with the whole page in view.",
      unsupported_file: "That file type won't work. Take a photo, or choose a JPG, PNG or PDF.",
      too_large: "That file is larger than 4 MB. Take a photo instead, or choose a smaller file.",
      upload: "The upload didn't finish. Check your connection and try again.",
    },
    toast: "Logbook uploaded",
  },

  confirm: {
    titleExtracted: "Is this right?",
    descriptionExtracted: "We read this from your logbook. Check each detail and fix anything that's wrong.",
    titleManual: "Tell us about your car",
    descriptionManual: "Fill in what you know. You can upload the logbook later.",
    checkThis: "Please check this — we weren't sure.",
    action: "Confirm details",
    fields: {
      plate: "Number plate",
      make: "Make",
      model: "Model",
      year: "Year of manufacture",
      chassisNumber: "Chassis number",
      bodyType: "Body type",
      ownerName: "Owner's name (as on the logbook)",
      operator: "Sacco or operator",
      financier: "Bank or lender, if the vehicle is on a loan",
    },
    hints: {
      make: "For example Toyota",
      model: "For example Fielder",
      chassisNumber: "Printed on the logbook, usually 10–17 characters",
      operator: "The Sacco or company the vehicle runs with",
      financier: "The insurer notes them on the policy. Leave empty if the vehicle is fully yours.",
    },
    errors: {
      required: (label: string) => `Enter the ${label.toLowerCase()}.`,
      year: "Enter a year between 1980 and this year.",
    },
    toast: "Details confirmed",
  },

  cover: {
    title: "What cover do you want?",
    description: "Not sure? Choose comprehensive — we'll explain the differences with your quotes.",
    label: "Type of cover",
    options: [
      {
        value: "comprehensive",
        label: "Comprehensive",
        description: "Covers your car and other people's property, including accidents, theft and fire.",
      },
      {
        value: "third_party_fire_theft",
        label: "Third party, fire and theft",
        description: "Covers other people, plus your car if it's stolen or catches fire.",
      },
      {
        value: "third_party",
        label: "Third party only",
        description: "The legal minimum. Covers damage you cause to other people and their property.",
      },
    ],
    action: "Continue",
    errors: { required: "Choose a type of cover to continue." },
  },

  value: {
    title: "Roughly what is your car worth?",
    description: "Your best guess is fine. Insurers use it to work out your premium.",
    label: "Value of your car",
    prefix: "KES",
    hint: "For example 1,200,000",
    action: "Continue",
    errors: {
      required: "Enter roughly what your car is worth.",
      invalid: "Enter an amount in shillings between 50,000 and 50,000,000.",
    },
  },

  name: {
    title: "Your details",
    description: "Your name as it appears on your national ID.",
    label: "Full name",
    emailLabel: "Email address (optional)",
    emailHint: "We'll email your quotes, receipt and policy documents too.",
    action: "Continue",
    errors: {
      required: "Enter your full name as it appears on your ID.",
      email: "That email address doesn't look right. Check it, or leave it empty.",
    },
  },

  id: {
    title: "Upload your national ID",
    description: "A photo of the front is enough.",
    label: "Photo of your national ID",
    reassurance:
      "Only our team sees your ID. We use it to confirm who you are for the insurer, and store it securely.",
    later: "I'll upload it later",
    errors: {
      unsupported_file: "That file type won't work. Take a photo, or choose a JPG, PNG or PDF.",
      too_large: "That file is larger than 4 MB. Take a photo instead, or choose a smaller file.",
      upload: "The upload didn't finish. Check your connection and try again.",
    },
    toast: "ID uploaded",
  },

  review: {
    title: "Check and send",
    description: "Make sure everything is right. You can change anything before you send.",
    sections: {
      you: "You",
      car: "Your car",
      cover: "Cover",
      documents: "Documents",
    },
    labels: {
      name: "Name",
      phone: "Phone",
      car: "Car",
      plate: "Number plate",
      year: "Year",
      chassisNumber: "Chassis number",
      coverType: "Type of cover",
      value: "Value",
      email: "Email",
      category: "Use",
      seats: "Passenger seats",
      period: "Cover period",
    },
    documentStatus: {
      uploaded: "Uploaded",
      verified: "Checked",
      needed: "Upload after you send",
      uploading: "Uploading now — you can still send",
      rejected: "Upload again",
    },
    notProvided: "Not provided",
    action: "Send application",
    toast: "Application sent",
  },

  done: {
    title: "Application sent",
    reference: (ref: string) => `Your reference is ${ref}`,
    body: "Keep your reference. You can follow your application at any time from the link below.",
    demoNote: "Demo: WhatsApp updates only reach numbers that have joined the demo. You can always follow your application here.",
    nextHeading: "What happens next",
    next: [
      "Compare quotes from our insurers and choose one.",
      "Pay with M-Pesa from your phone.",
      "We check your documents and issue your cover — on WhatsApp and email.",
    ],
    quotesReady: (count: number) => `${count} quotes are ready`,
    quotesFrom: (amount: string) => `From ${amount}. Compare the insurers and choose one — it takes a minute.`,
    compare: "Compare quotes",
    stillNeeded: "You still need to upload:",
    action: "See your application",
    home: "Back to home",
  },

  documents: {
    logbook: "Logbook",
    national_id: "National ID",
    kra_pin: "KRA PIN certificate",
    driving_licence: "Driving licence",
    passport: "Passport",
    business_registration: "Business registration certificate",
    dependants_ids: "IDs or birth certificates for others covered",
  },
  // For use mid-sentence ("Upload your KRA PIN certificate").
  documentsInline: {
    logbook: "logbook",
    national_id: "national ID",
    kra_pin: "KRA PIN certificate",
    driving_licence: "driving licence",
    passport: "passport",
    business_registration: "business registration certificate",
    dependants_ids: "IDs or birth certificates for the others covered",
  },

  // Names of steps for the "Need help?" WhatsApp message.
  stepNames: {
    phone: "phone number",
    code: "entering the code",
    vehicle: "number plate",
    logbook: "logbook photo",
    confirm: "checking car details",
    cover: "choosing cover",
    category: "vehicle use",
    kra: "KRA PIN upload",
    value: "car value",
    name: "my name",
    id: "ID upload",
    review: "checking and sending",
  },
} as const;
