import * as React from "react";
import { Logo } from "@/components/site/logo";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";

/** Frame for every admin screen. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-page items-center gap-3 px-4 py-2">
          <Logo href="/admin" />
          <span className="rounded-full bg-surface-alt px-3 py-1 text-sm font-medium text-ink-quiet">
            {admin.title}
          </span>
          <TextLink href="/" standalone quiet className="ml-auto text-sm">
            {admin.viewSite}
          </TextLink>
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-page flex-1 flex-col gap-6 px-4 py-6 md:py-8">
        {children}
      </main>
    </>
  );
}
