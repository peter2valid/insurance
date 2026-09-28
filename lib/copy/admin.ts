/** Admin strings. The admin needs a to-do list, not a database. */
export const admin = {
  title: "Admin",
  viewSite: "View site",
  boardHeading: "Today",
  boardIntro: "Work from the top. Anything that needs you is in the first list.",
  backToBoard: "Back to board",

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

  detail: {
    documents: "Documents",
    answers: "Answers",
  },

  actions: {
    nudge: "Nudge on WhatsApp",
    markVerified: "Mark verified",
    askReupload: "Ask for re-upload",
    addQuote: "Add quote",
    markQuotesReady: "Mark quotes ready",
    open: "Open",
  },

  // Stage 3 placeholder content. Replaced by real data in Stage 8.
  placeholder: {
    items: [
      { ref: "BC-4821", name: "Wanjiku Kamau", vehicle: "KDA 123A", note: "New · 4 min ago", badge: "new" },
      { ref: "BC-4817", name: "Otieno Odhiambo", vehicle: "KCZ 908K", note: "Stopped at step 3 · 12 min ago", badge: "stalled" },
    ],
    waitingItem: { ref: "BC-4810", name: "Amina Hassan", vehicle: "KDB 441M", note: "KRA PIN requested · 2 h ago" },
    badges: { new: "New", stalled: "Stalled" },
    detail: {
      ref: "BC-4821",
      name: "Wanjiku Kamau",
      documents: ["Logbook", "National ID"],
      answers: [
        { label: "Phone", value: "+254 712 345 678" },
        { label: "Number plate", value: "KDA 123A" },
        { label: "Make and model", value: "Toyota Fielder" },
        { label: "Year", value: "2016" },
        { label: "Cover type", value: "Comprehensive" },
        { label: "ID number", value: "•••• 5678" },
      ],
    },
  },
} as const;
