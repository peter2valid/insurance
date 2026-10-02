"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { msSinceLastToast, toast } from "@/components/ui/toast";

const POLL_MS = 3000;

/**
 * Keeps a page in sync: asks /api/version every few seconds whether anything
 * changed, and re-renders the page's server data when it did. Polling (not a
 * stream) so it works on Vercel. Shared by the client status page (one ref)
 * and the admin pages (everything).
 *
 * `watch` + `announce`: when the watched value changes after a refresh,
 * show a toast naming the change (motion only to show what changed).
 */
export function LiveRefresh({
  refValue,
  watch,
  announce,
  announceHref,
  announceLinkLabel,
  intervalMs,
}: {
  refValue?: string;
  watch?: string;
  announce?: string;
  /** Optional link in the announcement toast (e.g. open the application). */
  announceHref?: string;
  announceLinkLabel?: string;
  /** Also refresh on a timer — for time-based changes like stalled drafts. */
  intervalMs?: number;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const url = refValue ? `/api/version?ref=${encodeURIComponent(refValue)}` : "/api/version";
    let last: string | undefined;
    let stopped = false;

    async function check() {
      if (document.visibilityState === "hidden") return; // save data in background tabs
      try {
        const response = await fetch(url, { cache: "no-store" });
        const { v } = (await response.json()) as { v: string };
        if (!stopped && last !== undefined && v !== last) router.refresh();
        last = v;
      } catch {
        // Offline for a moment — try again on the next tick.
      }
    }

    void check();
    const poll = setInterval(check, POLL_MS);
    // Coming back to a background tab: catch up straight away.
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = intervalMs ? setInterval(() => router.refresh(), intervalMs) : undefined;
    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(poll);
      clearInterval(interval);
    };
  }, [refValue, router, intervalMs]);

  // Announce changes to the watched value (e.g. the application status).
  const last = React.useRef(watch);
  React.useEffect(() => {
    if (watch !== last.current) {
      last.current = watch;
      // Skip if the page just confirmed the user's own action (e.g. "Cover chosen").
      if (announce && msSinceLastToast() > 4000) {
        const action = announceHref && announceLinkLabel ? { href: announceHref, label: announceLinkLabel } : undefined;
        toast({ title: announce, tone: "info", action });
      }
    }
  }, [watch, announce, announceHref, announceLinkLabel]);

  return null;
}
