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
    // Shown until the broker writes their own in Admin → Website.
    fallback:
      "We help Kenyans insure their cars, matatus, boda bodas, health, travel and businesses — comparing insurers so you don't have to, and following up until you're covered.",
    licence: (regulator: string, number: string) => `${brand.name} is licensed by ${regulator}. Licence ${number}.`,
    teamHeading: "The people you'll talk to",
  },

  insurers: {
    heading: "Our insurers",
    intro: "We compare quotes from the insurers we work with, so you don't have to call each one.",
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
        a: "About five minutes to apply. Most quotes appear straight away; if we need to check anything, we message you on WhatsApp.",
      },
      {
        q: "Who sees my documents?",
        a: "Only our team and the insurer you choose. Your documents are stored securely, used only for your cover, and never shared for marketing.",
      },
      {
        q: "Why do you need my phone number?",
        a: "We send your quotes, receipt and policy to it on WhatsApp, with a link that opens your application straight away. No password, no code.",
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
    licence: (regulator: string, number: string) => `Licensed by ${regulator}. Licence ${number}.`,
    contactHeading: "Talk to us",
    whatsappLabel: (number: string) => `WhatsApp ${number}`,
    callLabel: (number: string) => `Call ${number}`,
    linksHeading: "Learn more",
    phone: brand.contact.phoneDisplay,
    whatsapp: brand.contact.whatsappDisplay,
    copyright: (year: number) => `© ${year} ${brand.name}`,
  },
} as const;
