import * as React from "react";
import { LiveRefresh } from "@/components/status/live-refresh";
import { admin } from "@/lib/copy";
import { getNavCounts } from "@/lib/data/queries";
import { getNotifier } from "@/lib/notify";
import { adminPasswordSet } from "@/lib/session";
import { AdminNav } from "./admin-nav";

/**
 * Frame for every admin screen: a sidebar on laptops, a top bar with a menu
 * on phones. Listens to every change so pages stay live, and toasts each
 * new message meant for the broker — "the moment a client submits,
 * answers, or stalls, the admin knows".
 */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const [outbox, counts] = await Promise.all([getNotifier().listOutbox(), getNavCounts()]);
  const latestForAdmin = outbox.find((item) => item.audience === "admin" && item.channel === "whatsapp");

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <LiveRefresh
        watch={latestForAdmin?.id}
        announce={latestForAdmin?.body}
        announceHref={latestForAdmin?.applicationRef ? `/admin/${latestForAdmin.applicationRef}` : undefined}
        announceLinkLabel={admin.openApplication}
        intervalMs={30_000}
      />
      <AdminNav counts={counts} canSignOut={adminPasswordSet()} />
      <main id="main" className="mx-auto flex w-full max-w-page min-w-0 flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
