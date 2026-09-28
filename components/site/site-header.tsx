"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/copy";
import { Logo } from "./logo";
import { WhatsAppButton } from "./whatsapp-button";

const copy = site.header;

/**
 * Site header. WhatsApp stays visible at every width; on mobile the other
 * links fold into a simple menu under the bar.
 */
export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const menuId = React.useId();

  // Close the menu on navigation and on Escape.
  const [lastPath, setLastPath] = React.useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-page items-center gap-2 px-4 py-2">
        <Logo />

        <nav aria-label={copy.menuLabel} className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {copy.nav.map((item) => (
              <li key={item.href}>
                <Button asChild variant="ghost" className="text-ink">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <WhatsAppButton
            label={copy.whatsapp}
            shortLabel={copy.whatsappShort}
            message={copy.whatsappMessage}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-ink lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? copy.closeMenu : copy.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          id={menuId}
          aria-label={copy.menuLabel}
          className="border-t border-border bg-surface shadow-overlay lg:hidden"
        >
          <ul className="mx-auto flex max-w-page flex-col px-4 py-2">
            {copy.nav.map((item) => (
              <li key={item.href}>
                <Button
                  asChild
                  variant="ghost"
                  block
                  className="justify-start text-ink"
                  onClick={() => setOpen(false)}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
