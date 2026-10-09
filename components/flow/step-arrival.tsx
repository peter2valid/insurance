"use client";

import * as React from "react";

/**
 * Each new step starts at the top, with its question focused for screen
 * readers (without a second scroll). Renders nothing.
 */
export function StepArrival({ step }: { step: string }) {
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [step]);
  return null;
}
