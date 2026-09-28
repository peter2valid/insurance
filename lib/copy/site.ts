import { brand } from "@/lib/brand";

/** Marketing site strings: header, footer and (for now) placeholder sections. */
export const site = {
  header: {
    homeLabel: `${brand.name} home`,
    nav: [
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

  // Stage 3 placeholder content. Replaced by the real hero and sections in Stage 5.
  placeholder: {
    heroHeading: "[Hero headline]",
    heroBody: "[The hero becomes step one of the application in Stage 5.]",
    heroAction: "Start with motor",
    sections: [
      { id: "about", heading: "About us", body: "[About section — Stage 5]" },
      { id: "insurers", heading: "Our insurers", body: "[Insurers section — Stage 5]" },
      { id: "faq", heading: "Questions", body: "[FAQ section — Stage 5]" },
    ],
  },
} as const;
