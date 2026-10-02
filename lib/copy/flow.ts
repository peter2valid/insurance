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
  continue: "Continue",
  saving: "Saving",

  loadError: {
    title: "We couldn't load this step",
    body: "Check your internet connection, then try again. Your answers so far are saved.",
    action: "Try again",
  },

  errors: {
    generic: "Something went wrong on our side. Try again, or message us on WhatsApp.",
    network: "We couldn't reach our server. Check your internet connection and try again.",
    notYours: "We couldn't open that application. Sign in with the phone number you used for it.",
  },

  phone: {
    title: "What's your phone number?",
    description: "We'll text you a code. There's no password to remember.",
    label: "Phone number",
    hint: "For example 712 345 678",
    reassurance: "We only use your number for this application and to update you about it.",
    action: "Send code",
    errors: {
      required: "Enter your phone number to continue.",
      invalid: "That doesn't look like a Kenyan mobile number. Check it starts with 7 or 1 and has 9 digits.",
    },
    toast: "Code sent (demo: no real text)",
  },

  code: {
    title: "Enter your code",
    description: (phone: string) => `Enter the 6-digit code for ${phone}.`,
    label: "Code",
    demoHint: "Demo: no text message is sent. The code is always 123456.",
    action: "Confirm code",
    resend: "Send a new code",
    changeNumber: "Use a different number",
    errors: {
      required: "Enter the 6-digit code.",
      wrong: "That code isn't right. Check it and try again.",
      expired: "That code has expired. Send a new one.",
      noPending: "Start by entering your phone number.",
    },
    toast: "Code confirmed",
    resentToast: "New code sent (demo: no real text)",
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
    description: "Take a photo of the page with your car's details. We'll read them for you.",
    label: "Photo of your logbook",
    reassurance: "Only our team sees your documents. They're stored securely and used only for this application.",
    takePhoto: "Take a photo",
    chooseFile: "Choose a file",
    reading: "Reading your logbook",
    readingBody: "This takes a few seconds.",
    later: "I don't have it with me",
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
    },
    hints: {
      make: "For example Toyota",
      model: "For example Fielder",
      chassisNumber: "Printed on the logbook, usually 10–17 characters",
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
    title: "What's your full name?",
    description: "As it appears on your national ID.",
    label: "Full name",
    action: "Continue",
    errors: { required: "Enter your full name as it appears on your ID." },
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
    },
    documentStatus: {
      uploaded: "Uploaded",
      verified: "Checked",
      needed: "Upload after you send",
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
      "We check your documents, usually within [X working hours].",
      "We compare insurers and send you quotes.",
      "You choose your cover, and we finalise it.",
    ],
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
    value: "car value",
    name: "my name",
    id: "ID upload",
    review: "checking and sending",
  },
} as const;
