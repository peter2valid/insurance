import { brand } from "@/lib/brand";

/**
 * Marketing site strings. Every fact about the business is a clearly
 * marked [placeholder] until the real details arrive (CLAUDE.md §7).
 */
export const site = {
  meta: {
    title: `${brand.name} — motor insurance from your phone`,
    description:
      "Apply for motor insurance from your phone. Snap your logbook, we compare insurers, you choose your cover.",
  },

  header: {
    homeLabel: `${brand.name} home`,
    nav: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#about", label: "About us" },
      { href: "/#insurers", label: "Our insurers" },
      { href: "/#faq", label: "Questions" },
    ],
    whatsapp: "WhatsApp us",
    whatsappShort: "WhatsApp",
    whatsappMessage: `Hello ${brand.name}, I'd like help with insurance.`,
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menuLabel: "Main menu",
  },

  hero: {
    heading: "Insure your car from your phone",
    body: "Snap your logbook, and we'll compare insurers and send you quotes. No forms to print, no chasing.",
    question: "What do you want to cover?",
    motor: {
      title: "Motor",
      body: "Private cars — third party or comprehensive",
      action: "Start with motor",
    },
    comingNext: "Coming next",
    others: [
      { id: "health", title: "Health" },
      { id: "travel", title: "Travel" },
      { id: "business", title: "Business" },
    ],
    needsHeading: "Have these ready",
    needs: ["Your logbook, or just the number plate", "Your national ID", "Your KRA PIN certificate"],
    duration: "About 5 minutes. You can stop and come back.",
  },

  howItWorks: {
    heading: "How it works",
    intro: "You do the first part from your phone. We do the chasing.",
    steps: [
      {
        title: "Snap your logbook",
        body: "Take a photo. We read the details for you, and you check them.",
      },
      {
        title: "We compare insurers",
        body: "We check your documents and send you quotes, with the differences explained.",
      },
      {
        title: "Choose your cover",
        body: "Pick the quote you want. We finalise it and tell you when you're covered.",
      },
    ],
    trackNote: "You get a link to follow your application at every step.",
  },

  about: {
    heading: "About us",
    body: [
      "[Who we are: two or three sentences about the agency — when it started, who it serves, and why clients trust it.]",
      "[What makes the service different, in plain words.]",
    ],
    licence: `${brand.name} is licensed by ${brand.licence.regulator}. Licence ${brand.licence.number}.`,
    teamHeading: "The people you'll talk to",
    team: [
      { name: "[Name]", role: "[Role, e.g. Principal broker]" },
      { name: "[Name]", role: "[Role, e.g. Client service]" },
      { name: "[Name]", role: "[Role, e.g. Claims support]" },
    ],
  },

  insurers: {
    heading: "Our insurers",
    intro: "We compare quotes from the insurers we work with, so you don't have to call each one.",
    placeholderName: "[Insurer name]",
    count: 6,
    note: "[Confirm the list of insurers the agency is appointed with before launch.]",
  },

  faq: {
    heading: "Questions",
    helpPrompt: "Didn't find your answer? Message us and a real person will reply.",
    items: [
      {
        q: "What do I need to apply?",
        a: "Your logbook (or just the number plate), your national ID and your KRA PIN certificate. A clear photo from your phone is fine.",
      },
      {
        q: "How long does it take?",
        a: "About five minutes to apply. We send quotes [within X working hours — confirm with the agency].",
      },
      {
        q: "Who sees my documents?",
        a: "Only our team, to prepare your quotes. [Add data protection details and a link to the privacy policy.]",
      },
      {
        q: "Why do you need my phone number?",
        a: "It's how you sign in — we text you a code, so there's no password to remember. We also use it to update you on WhatsApp.",
      },
      {
        q: "Do I pay online?",
        a: "Not at the moment. Once you've chosen your cover, we tell you exactly how to pay.",
      },
      {
        q: "Can I talk to someone?",
        a: "Yes. Message us on WhatsApp at any point — your reference is included so we know where you are.",
      },
    ],
  },

  footer: {
    licence: `Licensed by ${brand.licence.regulator}. Licence ${brand.licence.number}.`,
    contactHeading: "Talk to us",
    linksHeading: "Learn more",
    phone: brand.contact.phoneDisplay,
    whatsapp: brand.contact.whatsappDisplay,
    email: brand.contact.email,
    address: brand.contact.address,
    hours: brand.contact.hours,
    copyright: (year: number) => `© ${year} ${brand.name}`,
  },
} as const;
