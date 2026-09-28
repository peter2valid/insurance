"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { msSinceLastToast, toast } from "@/components/ui/toast";

/**
 * Keeps a page in sync: listens to /api/events and re-renders the page's
 * server data when something relevant changes. Shared by the client status
 * page (one ref) and the admin board (all refs).
 *
 * `watch` + `announce`: when the watched value changes after a refresh,
 * show a toast naming the change (motion only to show what changed).
 */
export function LiveRefresh({
  refValue,
  watch,
  announce,
  intervalMs,
}: {
  refValue?: string;
  watch?: string;
  announce?: string;
  /** Also refresh on a timer — for time-based changes like stalled drafts. */
  intervalMs?: number;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const url = refValue ? `/api/events?ref=${encodeURIComponent(refValue)}` : "/api/events";
    const source = new EventSource(url);
    let timer: ReturnType<typeof setTimeout> | undefined;

    source.onmessage = () => {
      // Several events often arrive together; refresh once.
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };

    const interval = intervalMs ? setInterval(() => router.refresh(), intervalMs) : undefined;

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      source.close();
    };
  }, [refValue, router, intervalMs]);

  // Announce changes to the watched value (e.g. the application status).
  const last = React.useRef(watch);
  React.useEffect(() => {
    if (watch !== last.current) {
      last.current = watch;
      // Skip if the page just confirmed the user's own action (e.g. "Cover chosen").
      if (announce && msSinceLastToast() > 4000) toast({ title: announce, tone: "info" });
    }
  }, [watch, announce]);

  return null;
}
