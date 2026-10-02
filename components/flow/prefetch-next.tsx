"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/** Warm up the likely next screen so moving on feels instant. Renders nothing. */
export function PrefetchNext({ href }: { href?: string }) {
  const router = useRouter();
  React.useEffect(() => {
    if (href) router.prefetch(href);
  }, [href, router]);
  return null;
}
