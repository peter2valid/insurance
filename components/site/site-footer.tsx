import { TextLink } from "@/components/ui/text-link";
import { site } from "@/lib/copy";
import { whatsappUrl } from "@/lib/whatsapp";
import { Logo } from "./logo";

const copy = site.footer;

/** Site footer. Every fact here comes from lib/brand.ts placeholders. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-page gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-prose text-sm text-ink-quiet">{copy.licence}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-base font-semibold">{copy.contactHeading}</h2>
          <ul className="flex flex-col text-sm text-ink-quiet">
            <li>
              <TextLink href={whatsappUrl()} external standalone quiet>
                {copy.whatsapp}
              </TextLink>
            </li>
            <li className="py-2">{copy.phone}</li>
            <li className="py-2">{copy.email}</li>
            <li className="py-2">{copy.address}</li>
            <li className="py-2">{copy.hours}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-base font-semibold">{copy.linksHeading}</h2>
          <ul className="flex flex-col">
            {site.header.nav.map((item) => (
              <li key={item.href}>
                <TextLink href={item.href} standalone quiet className="text-sm">
                  {item.label}
                </TextLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto w-full max-w-page px-4 py-4 text-sm text-ink-quiet">
          {copy.copyright(new Date().getFullYear())}
        </p>
      </div>
    </footer>
  );
}
