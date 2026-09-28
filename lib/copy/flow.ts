/** Client application flow strings. */
export const flow = {
  help: "Need help?",
  helpMessage: (step: string) => `Hello, I need help with my application. I'm on: ${step}.`,
  exitLabel: "Back to home",

  loadError: {
    title: "We couldn't load this step",
    body: "Check your internet connection, then try again. Your answers so far are saved.",
    action: "Try again",
  },

  // Stage 3 placeholder step. Replaced by the real flow in Stage 6.
  placeholder: {
    title: "What's your phone number?",
    description: "We'll text you a code. There's no password to remember.",
    phoneLabel: "Phone number",
    phoneHint: "For example 712 345 678",
    action: "Send code",
    secondary: "Why do you need my number?",
    reassurance: "We only use your number for this application.",
  },
} as const;
