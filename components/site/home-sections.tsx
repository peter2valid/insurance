import { Building2, Camera, FileCheck, ShieldCheck } from "lucide-react";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { site } from "@/lib/copy";
import { SiteSection } from "./site-page";

/* Home page sections below the hero. Quiet and consistent (CLAUDE.md §4.2). */

const stepIcons = [Camera, FileCheck, ShieldCheck];

/** A genuine sequence, so numbered steps are allowed here. */
export function HowItWorks() {
  const copy = site.howItWorks;
  return (
    <SiteSection id="how-it-works" title={copy.heading} intro={copy.intro}>
      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {copy.steps.map((step, index) => {
          const Icon = stepIcons[index];
          return (
            <li key={step.title} className="flex gap-4 md:flex-col md:gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-alt text-brand">
                <Icon className="size-6" aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg">
                  <span className="text-ink-quiet">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="max-w-prose text-base text-ink-quiet">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-base text-ink">{copy.trackNote}</p>
    </SiteSection>
  );
}

export function About() {
  const copy = site.about;
  return (
    <SiteSection id="about" title={copy.heading} tone="alt">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {copy.body.map((paragraph) => (
            <p key={paragraph} className="max-w-prose text-lg text-ink">
              {paragraph}
            </p>
          ))}
          <p className="flex items-start gap-2 text-base text-ink-quiet">
            <span className="flex h-6 shrink-0 items-center">
              <ShieldCheck className="size-5 text-brand" aria-hidden />
            </span>
            {copy.licence}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg">{copy.teamHeading}</h3>
          <ul className="flex flex-col gap-3">
            {copy.team.map((member, index) => (
              <li key={index} className="flex items-center gap-3">
                <Avatar name={member.name} className="bg-surface" />
                <div className="flex flex-col">
                  <span className="text-base font-medium text-ink">{member.name}</span>
                  <span className="text-sm text-ink-quiet">{member.role}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteSection>
  );
}

export function Insurers() {
  const copy = site.insurers;
  return (
    <SiteSection id="insurers" title={copy.heading} intro={copy.intro}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: copy.count }, (_, index) => (
          <li
            key={index}
            className="flex min-h-touch items-center gap-2 rounded-control border border-dashed border-border px-4 py-4 text-sm text-ink-quiet"
          >
            <Building2 className="size-5 shrink-0" aria-hidden />
            {copy.placeholderName}
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-quiet">{copy.note}</p>
    </SiteSection>
  );
}

export function Faq() {
  const copy = site.faq;
  return (
    <SiteSection id="faq" title={copy.heading} tone="alt">
      <dl className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        {copy.items.map((item) => (
          <div key={item.q} className="flex flex-col gap-2">
            <dt className="font-heading text-lg font-semibold text-ink">{item.q}</dt>
            <dd className="max-w-prose text-base text-ink-quiet">{item.a}</dd>
          </div>
        ))}
      </dl>
      <Card className="md:flex-row md:items-center md:justify-between">
        <p className="text-base text-ink">{copy.helpPrompt}</p>
        <WhatsAppButton label={site.header.whatsapp} message={site.header.whatsappMessage} />
      </Card>
    </SiteSection>
  );
}
