/** Admin strings. The admin needs a to-do list, not a database (CLAUDE.md §1). */
export const admin = {
  title: "Admin",
  viewSite: "View site",
  nav: {
    board: "Board",
    outbox: "Outbox",
  },
  boardHeading: "Today",
  boardSummary: (count: number) =>
    count === 0 ? "Nothing needs you right now." : count === 1 ? "1 thing needs you. Start here." : `${count} things need you. Start at the top.`,
  boardIntro: "Work from the top. Anything that needs you is in the first list.",
  backToBoard: "Back to board",
  liveNote: "Updates by itself as clients act.",

  buckets: {
    needsMe: "Needs me now",
    waiting: "Waiting on client",
    quotesOut: "Quotes out",
    done: "Done",
  },

  empty: {
    needsMe: {
      title: "Nothing needs you right now",
      body: "New applications, stalled clients and replies appear here the moment they happen.",
    },
    other: {
      title: "Nothing here yet",
      body: "Applications move here on their own as they progress.",
    },
  },

  // Why an application is on the board, in the broker's words.
  badges: {
    new_submission: "New",
    stalled: "Stalled",
    replied: "Replied",
    documents_uploaded: "To check",
    ready_to_quote: "Ready for quotes",
    cover_chosen: "Chose cover",
  },
  notes: {
    new_submission: (ago: string) => `Sent ${ago}`,
    stalled: (step: number, total: number, ago: string) => `Stopped at step ${step} of ${total} · ${ago}`,
    replied: (ago: string) => `Replied ${ago}`,
    documents_uploaded: (ago: string) => `Uploaded a document ${ago}`,
    ready_to_quote: "Documents checked · ready for quotes",
    cover_chosen: (ago: string) => `Chose cover ${ago}`,
    inProgress: (step: number, total: number, ago: string) => `Filling in · step ${step} of ${total} · ${ago}`,
    waitingFor: (doc: string, ago: string) => `Waiting for ${doc} · asked ${ago}`,
    waitingGeneric: (ago: string) => `Waiting on client · ${ago}`,
    quotesSent: (ago: string) => `Quotes sent ${ago}`,
    covered: (date: string) => `Covered · ${date}`,
  },
  // Status in the broker's words (the client sees lib/copy/status labels).
  statusLabels: {
    received: "Received",
    documents_checked: "Documents checked",
    preparing_quotes: "Preparing quotes",
    needs_info: "Asked for more",
    quotes_ready: "Quotes sent",
    cover_chosen: "Chose cover",
    covered: "Covered",
  },
  docStatus: {
    needed: "Not uploaded",
    uploaded: "To check",
    verified: "Verified",
    rejected: "Re-upload asked",
  },
  answerLabels: {
    product: "Insurance",
    name: "Name",
    phone: "Phone",
    coverType: "Type of cover",
    vehicleValueKes: "Value",
    usage: "Use",
    submitted: "Sent",
    started: "Started",
  },
  noName: "Name not given yet",
  noVehicle: "No plate yet",

  detail: {
    documents: "Documents",
    answers: "Answers",
    messages: "Messages",
    quotes: "Quotes",
    nextStep: "Next step",
    noMessages: "No messages yet.",
    noQuotes: "No quotes yet.",
    fromClient: "Client",
    fromUs: "You",
    sampleFile: "Sample data — no file attached in the demo.",
    openFile: "Open file",
    waitingForClient: "Waiting for the client to upload this.",
    chosen: "Chosen by the client",
    notFound: {
      title: "We can't find that application",
      body: "It may have been removed when the demo data was reset. Go back to the board.",
    },
  },

  // What the broker should do next, per stage. One primary action each.
  next: {
    check: {
      title: "Check the documents",
      body: "Compare each document with the answers, then mark it verified or ask for a new one.",
    },
    waitingDocs: {
      title: "Waiting for the client",
      body: "They still need to upload a document. You can nudge them on WhatsApp.",
    },
    draft: {
      title: "The client hasn't sent this yet",
      body: "They're still filling it in. If they've gone quiet, nudge them on WhatsApp.",
    },
    addQuotes: {
      title: "Send quotes",
      body: "We've prepared 3 quotes from the client's answers. Send them in one click, or add your own.",
    },
    quotesReady: {
      title: "Quotes added",
      body: "When you've added them all, mark quotes ready. The client can then choose.",
    },
    waitingChoice: {
      title: "Waiting for the client to choose",
      body: "They can see the quotes on their page. Nudge them if they need a push.",
    },
    finalise: {
      title: "Finalise the cover",
      body: "The client has chosen. Arrange the cover with the insurer, then mark it covered.",
    },
    covered: {
      title: "Done",
      body: "This client is covered.",
    },
  },

  actions: {
    sendQuotes: "Send 3 quotes",
    sendQuotesShort: "Send quotes",
    verifyAll: "Verify all documents",
    review: "Review",
    readReply: "Read reply",
    nudgeShort: "Nudge",
    addQuoteManually: "Add a quote by hand",
    nudge: "Nudge on WhatsApp",
    markVerified: "Mark verified",
    askReupload: "Ask for re-upload",
    addQuote: "Add quote",
    markQuotesReady: "Mark quotes ready",
    markCovered: "Mark covered",
  },

  // Toasts match the button words (CLAUDE.md §7), and say messages are simulated.
  toasts: {
    quotesSent: "3 quotes sent — client notified (see Outbox)",
    nudged: "Sample client: the nudge is logged in the Outbox (sample numbers are never messaged).",
    nudgeOff: "Not sent: real WhatsApp is off on this site. Open the Outbox to see what's missing.",
    nudgeSent: "Nudge sent on WhatsApp",
    nudgeFailed: "WhatsApp not delivered — usually because that number hasn't joined the demo yet. See the Outbox.",
    verified: "Marked verified",
    verifiedAll: "All documents verified — client notified (see Outbox)",
    reuploadRequested: "Re-upload requested — client notified (see Outbox)",
    quoteAdded: "Quote added",
    quotesReady: "Quotes ready — client notified (see Outbox)",
    covered: "Marked covered — client notified (see Outbox)",
  },

  errors: {
    generic: "That didn't work. Refresh the page and try again.",
    notAllowed: "That action doesn't fit this application's stage any more. Refresh to see the latest.",
    noQuotes: "Add at least one quote first.",
  },

  reupload: {
    title: (doc: string) => `Ask for a new ${doc}?`,
    description: "We'll message the client on WhatsApp with the reason you choose (simulated in the demo).",
    reasonLabel: "Reason",
    reasons: [
      { value: "blurry", label: "The photo is blurry", message: "The photo is blurry. Please take it again in good light." },
      { value: "cut_off", label: "Part of it is cut off", message: "Part of the document is cut off. Please make sure the whole page is in the photo." },
      { value: "wrong_document", label: "It's the wrong document", message: "This looks like a different document. Please upload the right one." },
      { value: "mismatch", label: "Details don't match", message: "Some details don't match your answers. Please check and upload it again." },
    ],
    confirm: "Send request",
    cancel: "Cancel",
    errors: { reason: "Choose a reason so the client knows what to fix." },
  },

  quoteForm: {
    title: "Add a quote",
    description: "Pre-filled with a suggestion. Check the numbers against the insurer's quote.",
    insurer: "Insurer",
    insurerHint: "Use the real insurer name once partners are confirmed.",
    coverType: "Type of cover",
    premium: "Premium per year",
    premiumForTrip: "Premium for this trip",
    excess: "Excess",
    benefits: "Benefits",
    benefitsHint: "Separate with commas, e.g. Windscreen cover, Towing",
    confirm: "Add quote",
    cancel: "Cancel",
    errors: {
      insurer: "Enter the insurer's name.",
      premium: "Enter the yearly premium in shillings.",
      excess: "Enter the excess in shillings, or leave it empty.",
      coverType: "Choose the type of cover.",
    },
  },

  whatsappCheck: {
    on: "Real WhatsApp is on (Twilio sandbox)",
    onBody: "Messages to applicants who joined the sandbox are really sent. Use the test to check your own number.",
    off: "WhatsApp is simulated on this site",
    offBody: (missing: string) =>
      `The server can't see: ${missing}. In Netlify, add them under Environment variables (scope: Functions or All), then Deploys → Trigger deploy.`,
    test: "Send test WhatsApp",
    testMessage: "Test from your Beacon Cover admin. If you can read this, real WhatsApp messages are working.",
    results: {
      sent: (status: string) => `Twilio accepted it (status: ${status}). Check your WhatsApp.`,
      not_configured: "Not sent: the Twilio keys aren't set on this site yet.",
      auth: "Not sent: Twilio rejected the keys. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN (no spaces), then redeploy.",
      not_joined: "Not delivered: this number hasn't joined the sandbox. From WhatsApp, send your \"join …\" code to the sandbox number, then try again.",
      window:
        "Not delivered: WhatsApp only allows free-form messages within 24 hours of the person messaging you. From that phone, send any WhatsApp (e.g. \"hi\") to your Twilio WhatsApp number, then try again.",
      template_only:
        "Not sent: this WhatsApp number only accepts pre-approved templates. For the demo, use the Twilio Sandbox: set TWILIO_WHATSAPP_FROM to the sandbox number (usually whatsapp:+14155238886), send its \"join …\" code from your phone, then redeploy.",
      bad_sender: "Not sent: TWILIO_WHATSAPP_FROM isn't your sandbox number. Copy your WhatsApp sender from Twilio (e.g. whatsapp:+17372508034).",
      bad_number: "Not sent: Twilio says the destination number isn't valid for WhatsApp.",
      network: "Not sent: couldn't reach Twilio. Try again in a moment.",
      other: (detail: string) => `Not sent. Twilio says: ${detail}`,
    },
  },

  whatsapp: {
    realHint: "Opens your WhatsApp with the message typed. Press send.",
    autoHint: "Sends a real WhatsApp from the demo number.",
    sampleHint: "Sample client — the message is shown in the Outbox only.",
    sendFromOutbox: "Send on WhatsApp",
  },

  demo: {
    heading: "Demo tools",
    body: "Start the demo again from the sample applications. Only visible to you.",
    reset: "Reset demo data",
    confirmTitle: "Reset demo data?",
    confirmBody:
      "This removes every application, upload and message created during the demo, and brings back the sample applications. It can't be undone.",
    cancel: "Cancel",
    toast: "Demo data reset",
  },
  openApplication: "Open",

  outbox: {
    heading: "Outbox",
    intro: "Every message the system sent or would have sent. Only messages marked “Sent on WhatsApp” really went out; the rest are simulated.",
    empty: {
      title: "No messages yet",
      body: "When a client applies or you take an action, the message appears here.",
    },
    toClient: "To client",
    toAdmin: "To you",
    simulated: "Simulated",
    sent: "Sent on WhatsApp",
    failed: "Not delivered",
    failedHint: "Twilio didn't deliver it — usually because this number hasn't joined the WhatsApp demo yet.",
    viewApplication: "Open application",
  },
} as const;
