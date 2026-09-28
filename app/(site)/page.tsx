import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteSection } from "@/components/site/site-page";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/copy";

// Stage 3 placeholder content inside the SitePage template.
// The real hero and sections arrive in Stage 5.
export default function HomePage() {
  const copy = site.placeholder;

  return (
    <>
      <SiteSection>
        <div className="flex flex-col gap-4 py-8">
          <h1 className="text-3xl">{copy.heroHeading}</h1>
          <p className="max-w-prose text-lg text-ink-quiet">{copy.heroBody}</p>
          <Button asChild className="self-start">
            <Link href="/start/phone">
              {copy.heroAction}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </SiteSection>
      {copy.sections.map((section, index) => (
        <SiteSection
          key={section.id}
          id={section.id}
          title={section.heading}
          intro={section.body}
          tone={index % 2 === 0 ? "alt" : "default"}
        />
      ))}
    </>
  );
}
