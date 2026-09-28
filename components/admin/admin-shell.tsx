import * as React from "react";
import { Logo } from "@/components/site/logo";
import { LiveRefresh } from "@/components/status/live-refresh";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";
import { getNotifier } from "@/lib/notify";
import Link from "next/link";

/**
 * Frame for every admin screen. Listens to every event so the board and
 * details stay live, and toasts each new message meant for the broker —
 * "the moment a client submits, answers, or stalls, the admin knows".
 */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const outbox = await getNotifier().listOutbox();
  const latestForAdmin = outbox.find((item) => item.audience === "admin");

  return (
    <>
      <LiveRefresh watch={latestForAdmin?.id} announce={latestForAdmin?.body} intervalMs={30_000} />
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-page items-center gap-3 px-4 py-2">
          <Logo href="/admin" />
          <span className="hidden rounded-full bg-surface-alt px-3 py-1 text-sm font-medium text-ink-quiet sm:inline">
            {admin.title}
          </span>
          <nav aria-label={admin.title} className="ml-auto flex items-center">
            <Button asChild variant="ghost" className="px-3 text-ink">
              <Link href="/admin">{admin.nav.board}</Link>
            </Button>
            <Button asChild variant="ghost" className="px-3 text-ink">
              <Link href="/admin/outbox">
                {admin.nav.outbox}
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface-alt px-2 text-sm text-ink-quiet">
                  {outbox.length}
                </span>
              </Link>
            </Button>
            <TextLink href="/" standalone quiet className="hidden px-2 text-sm sm:inline-flex">
              {admin.viewSite}
            </TextLink>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-page flex-1 flex-col gap-6 px-4 py-6 md:py-8">
        {children}
      </main>
    </>
  );
}
