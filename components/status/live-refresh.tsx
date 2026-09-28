"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

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
}: {
  refValue?: string;
  watch?: string;
  announce?: string;
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

    return () => {
      clearTimeout(timer);
      source.close();
    };
  }, [refValue, router]);

  // Announce changes to the watched value (e.g. the application status).
  const last = React.useRef(watch);
  React.useEffect(() => {
    if (watch !== last.current) {
      last.current = watch;
      if (announce) toast({ title: announce, tone: "info" });
    }
  }, [watch, announce]);

  return null;
}
