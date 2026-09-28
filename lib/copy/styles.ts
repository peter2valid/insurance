/** Strings for the internal /styles kitchen-sink page. */
export const styles = {
  meta: { title: "Styles" },
  heading: "Design tokens",
  intro:
    "Every visual value in the app comes from these tokens. Toggle your system theme to check dark mode.",
  sections: {
    colour: "Colour",
    type: "Type scale",
    fonts: "Typefaces",
    spacing: "Spacing",
    radius: "Radius",
    shadow: "Shadow",
  },
  fonts: {
    heading: "IBM Plex Serif 600 — headings",
    body: "IBM Plex Sans — body and interface",
  },
  sample: "Upload your logbook",
  back: "Back to home",
} as const;
