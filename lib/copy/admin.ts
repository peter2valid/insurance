/** Admin strings. The admin needs a to-do list, not a database (CLAUDE.md §1). */
export const admin = {
  title: "Admin",
  viewSite: "View site",
  nav: {
    board: "Board",
    outbox: "Outbox",
  },
  boardHeading: "Today",
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
      title: "Add quotes",
      body: "Add a quote from each insurer, then mark quotes ready to let the client choose.",
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
    nudge: "Nudge on WhatsApp",
    markVerified: "Mark verified",
    askReupload: "Ask for re-upload",
    addQuote: "Add quote",
    markQuotesReady: "Mark quotes ready",
    markCovered: "Mark covered",
  },

  // Toasts match the button words (CLAUDE.md §7), and say messages are simulated.
  toasts: {
    nudged: "Nudge sent (simulated — see Outbox)",
    verified: "Marked verified",
    verifiedAll: "All documents verified — client updated (simulated message)",
    reuploadRequested: "Re-upload requested — client notified (simulated)",
    quoteAdded: "Quote added",
    quotesReady: "Quotes ready — client notified (simulated)",
    covered: "Marked covered — client notified (simulated)",
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
    intro: "Every message the system would have sent. Nothing here was really sent — it's a demo.",
    empty: {
      title: "No messages yet",
      body: "When a client applies or you take an action, the message appears here.",
    },
    toClient: "To client",
    toAdmin: "To you",
    simulated: "Simulated",
    viewApplication: "Open application",
  },
} as const;
