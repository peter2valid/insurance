/**
 * Default strings used inside kit components (components/ui).
 * Screens pass their own labels; these cover the shared bits.
 */
export const kit = {
  optional: "optional",
  loading: "Loading",
  close: "Close",
  back: "Back",
  step: (current: number, total: number) => `Step ${current} of ${total}`,

  otp: {
    hint: (length: number) => `${length} digits`,
  },

  select: {
    placeholder: "Choose one",
  },

  upload: {
    takePhoto: "Take a photo",
    chooseFile: "Choose a file",
    replace: "Replace",
    remove: "Remove",
    uploading: "Uploading",
    uploaded: "Uploaded",
    accepted: "Photo or PDF, up to 10 MB",
  },

  timeline: {
    done: "Done",
    current: "Current step",
    upcoming: "Coming up",
  },

  checklist: {
    needed: "Needed",
    uploaded: "Received, checking now",
    verified: "Checked",
    rejected: "Please upload again",
  },
} as const;
