import { brand } from "@/lib/brand";

/**
 * Marketing site strings. Every fact about the business is a clearly
 * marked [placeholder] until the real details arrive (CLAUDE.md §7).
 */
export const site = {
  meta: {
    title: `${brand.name} — insurance from your phone`,
    description:
      "Apply for motor, health, travel or business insurance from your phone. We compare insurers, you choose your cover.",
  },

  header: {
    homeLabel: `${brand.name} home`,
    nav: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#about", label: "About us" },
      { href: "/#insurers", label: "Our insurers" },
      { href: "/#faq", label: "Questions" },
      { href: "/#agents", label: "Agents" },
    ],
    whatsapp: "WhatsApp us",
    whatsappShort: "WhatsApp",
    whatsappMessage: `Hello ${brand.name}, I'd like help with insurance.`,
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menuLabel: "Main menu",
  },

  hero: {
    heading: "Insurance you can sort out from your phone",
    body: "Private car, matatu, taxi or boda boda — plus health, travel and business. Compare insurers, choose your cover and pay with M-Pesa, all from your phone.",
    question: "What do you want to cover?",
    needsHeading: "Have these ready",
    needs: [
      "Your national ID (or passport for travel)",
      "Your KRA PIN",
      "Your logbook, if it's for a vehicle",
    ],
    referred: (name: string) => `You were referred by ${name}, one of our agents.`,
    duration: "About 5 minutes. You can stop and come back.",
  },

  howItWorks: {
    heading: "How it works",
    intro: "You do the first part from your phone. We do the chasing.",
    steps: [
      {
        title: "Answer a few questions",
        body: "Pick your cover and tell us the basics. For a car, just snap your logbook.",
      },
      {
        title: "Compare insurers",
        body: "See quotes from our insurers straight away, with the total you pay and what each one covers.",
      },
      {
        title: "Pay and get covered",
        body: "Pay with M-Pesa. We check your documents and send your policy on WhatsApp and email — and remind you before it ends.",
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
    note: "[Confirm the final list of insurers the agency places business with before launch.]",
  },

  agents: {
    heading: "Earn as an agent",
    body: "Know people who need insurance? Share your own link. When they pay for their cover, you earn commission — paid to your M-Pesa.",
    join: "Become an agent",
    signIn: "Agent sign-in",
  },

  faq: {
    heading: "Questions",
    helpPrompt: "Didn't find your answer? Message us and a real person will reply.",
    items: [
      {
        q: "What do I need to apply?",
        a: "For a vehicle: your logbook (or just the plate), national ID and KRA PIN. For health: your national ID. For travel: your passport. For a business: the registration certificate, KRA PIN and the owner's ID. A clear photo from your phone is fine.",
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
        q: "How do I pay?",
        a: "With M-Pesa, from your phone. Once you choose a quote, we send a payment request — enter your PIN and you're done. Matatus, taxis and boda bodas can also pay monthly.",
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
