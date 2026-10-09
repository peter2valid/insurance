"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarClock,
  ExternalLink,
  House,
  Inbox,
  LogOut,
  Menu,
  MessagesSquare,
  ShieldCheck,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { adminSignOutAction } from "@/app/admin/actions";
import { brand } from "@/lib/brand";
import { admin } from "@/lib/copy";
import type { NavCounts } from "@/lib/data/queries";
import { cn } from "@/lib/utils";
import { useAdminAction } from "./action-button";

type Item = { href: string; label: string; icon: LucideIcon; count?: number; urgent?: boolean };

function groups(counts: NavCounts): { label: string; items: Item[] }[] {
  const n = admin.nav;
  return [
    {
      label: admin.navGroups.work,
      items: [
        { href: "/admin", label: n.today, icon: House, count: counts.needsMe, urgent: true },
        { href: "/admin/applications", label: n.board, icon: Inbox },
        { href: "/admin/renewals", label: n.renewals, icon: CalendarClock, count: counts.renewals },
      ],
    },
    {
      label: admin.navGroups.money,
      items: [
        { href: "/admin/payments", label: n.payments, icon: Wallet },
        { href: "/admin/agents", label: n.agents, icon: Users, count: counts.agentRequests, urgent: true },
      ],
    },
    {
      label: admin.navGroups.system,
      items: [
        { href: "/admin/automations", label: n.automations, icon: Bell },
        { href: "/admin/insurers", label: n.insurers, icon: Building2 },
        { href: "/admin/outbox", label: n.outbox, icon: MessagesSquare },
      ],
    },
  ];
}

/** Which nav item a path belongs to (an application's page counts as Applications). */
function isActive(href: string, path: string): boolean {
  if (href === "/admin") return path === "/admin";
  if (href === "/admin/applications") return path === href || /^\/admin\/[A-Z]{2}-\d+/.test(path);
  return path === href || path.startsWith(`${href}/`);
}

function NavList({ counts, path, onNavigate }: { counts: NavCounts; path: string; onNavigate?: () => void }) {
  return (
    <nav aria-label={admin.title} className="flex flex-col gap-6">
      {groups(counts).map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium text-on-sidebar opacity-70">{group.label}</p>
          <ul className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(item.href, path);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-touch items-center gap-3 rounded-control px-3 text-base text-on-sidebar transition-colors",
                      active ? "bg-on-sidebar/15 font-medium" : "opacity-85 hover:bg-on-sidebar/10 hover:opacity-100",
                    )}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.count ? (
                      <span
                        className={cn(
                          "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums",
                          item.urgent ? "bg-on-sidebar text-sidebar" : "bg-on-sidebar/15 text-on-sidebar",
                        )}
                      >
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Footer({ canSignOut }: { canSignOut: boolean }) {
  const signOut = useAdminAction(adminSignOutAction);
  const linkClass =
    "flex min-h-touch items-center gap-3 rounded-control px-3 text-sm text-on-sidebar opacity-85 transition-colors hover:bg-on-sidebar/10 hover:opacity-100";
  return (
    <div className="flex flex-col gap-1 border-t border-on-sidebar/15 pt-4">
      <Link href="/" className={linkClass}>
        <ExternalLink className="size-4" aria-hidden />
        {admin.viewSite}
      </Link>
      {canSignOut && (
        <form action={signOut.formAction}>
          <button type="submit" className={cn(linkClass, "w-full")}>
            <LogOut className="size-4" aria-hidden />
            {admin.signOut}
          </button>
        </form>
      )}
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex min-h-touch items-center gap-2 rounded-control px-3 text-on-sidebar">
      <ShieldCheck className="size-6" aria-hidden />
      <span className="font-heading text-lg font-semibold whitespace-nowrap">{brand.name}</span>
    </Link>
  );
}

/** Sidebar (laptops) and top bar + slide-in menu (phones). */
export function AdminNav({ counts, canSignOut }: { counts: NavCounts; canSignOut: boolean }) {
  const path = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 overflow-y-auto bg-sidebar px-3 py-4 lg:flex">
        <Brand />
        <div className="flex-1">
          <NavList counts={counts} path={path} />
        </div>
        <Footer canSignOut={canSignOut} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-sidebar px-2 py-1 lg:hidden">
        <Brand />
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger
            className="relative flex size-touch items-center justify-center rounded-control text-on-sidebar hover:bg-on-sidebar/10"
            aria-label={admin.menu}
          >
            <Menu className="size-6" aria-hidden />
            {counts.needsMe > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-accent" aria-hidden />}
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-full flex-col gap-6 overflow-y-auto bg-sidebar px-3 py-2 outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right motion-reduce:animate-none">
              <div className="flex items-center justify-between">
                <DialogPrimitive.Title className="px-3 font-heading text-lg font-semibold text-on-sidebar">{admin.menu}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">{admin.title}</DialogPrimitive.Description>
                <DialogPrimitive.Close
                  className="flex size-touch items-center justify-center rounded-control text-on-sidebar hover:bg-on-sidebar/10"
                  aria-label={admin.closeMenu}
                >
                  <X className="size-6" aria-hidden />
                </DialogPrimitive.Close>
              </div>
              <div className="flex-1">
                <NavList counts={counts} path={path} onNavigate={() => setOpen(false)} />
              </div>
              <Footer canSignOut={canSignOut} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </header>
    </>
  );
}
