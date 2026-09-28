import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TextLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  /**
   * On its own line (not inside a sentence): gets the 44px touch target.
   * Inline links inside text are exempt from the target size.
   */
  standalone?: boolean;
  /** Opens in a new tab (WhatsApp, external sites). */
  external?: boolean;
  /** Quieter colour, for footers and secondary links. */
  quiet?: boolean;
};

/** Underlined link. Buttons do things; links go places. */
function TextLink({
  className,
  standalone,
  external,
  quiet,
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link
      data-slot="text-link"
      className={cn(
        "rounded-control font-medium underline underline-offset-4 transition-colors",
        quiet ? "text-ink-quiet hover:text-ink" : "text-brand hover:text-brand-dark",
        standalone && "inline-flex min-h-touch items-center gap-2 self-start",
        className,
      )}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </Link>
  );
}

export { TextLink };
export type { TextLinkProps };
