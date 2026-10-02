/**
 * Brand details — the one place to change the agency's identity.
 *
 * Everything in [square brackets] is a PLACEHOLDER. Replace with the real
 * details before launch. Never invent licence numbers, partners or stats.
 */
export const brand = {
  name: "Beacon Cover", // placeholder brand name
  shortName: "Beacon",
  refPrefix: "BC", // application references look like "BC-4821"
  tagline: "[Tagline]",

  // Used in links inside messages. Set SITE_URL in the environment for a real domain.
  // On Vercel this falls back to the production domain automatically.
  siteUrl:
    process.env.SITE_URL ??
    // Netlify sets URL to the site's main address (e.g. https://insurance20.netlify.app).
    process.env.URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),

  licence: {
    number: "[Licence no.]",
    regulator: "[Regulator name]",
  },

  contact: {
    phoneDisplay: "+254 117 537 025",
    whatsappDisplay: "+254 117 537 025",
    // The agency's WhatsApp: international format, digits only, for wa.me links.
    whatsappE164: "254117537025",
    email: "[Email address]",
    address: "[Office address]",
    hours: "[Opening hours]",
  },

  locale: {
    language: "en-KE",
    currency: "KES",
    phoneCountryCode: "+254",
    timeZone: "Africa/Nairobi",
  },
} as const;

export type Brand = typeof brand;
