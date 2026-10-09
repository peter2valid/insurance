import { brand } from "@/lib/brand";

/** Strings shared across the site, flow, status page and admin. */
export const common = {
  meta: {
    title: brand.name,
    description: `${brand.name} — compare insurers and get covered from your phone: motor, matatu, boda boda, health, travel and business. Pay with M-Pesa.`,
    shareHeadline: "Insurance you can sort out from your phone",
    shareLine: "Compare insurers · Pay with M-Pesa · Motor, health, travel, business",
  },
  skipToContent: "Skip to main content",
  help: "Need help?",
  helpMessage: "Hello, I need help with the website.",
  notFound: {
    title: "We can't find that page",
    body: "The link may be old or mistyped. Start again from the home page, or message us on WhatsApp.",
    action: "Go to the home page",
  },
  error: {
    title: "Something went wrong on our side",
    body: "It's not something you did. Try again — anything you've already sent is saved.",
    action: "Try again",
    home: "Go to the home page",
  },
} as const;
