import Link from "next/link";
import { Camera, FileCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { panelInsurers } from "@/lib/data/insurers";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { site } from "@/lib/copy";
import type { SiteContent } from "@/lib/data/types";
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

/** Words and people from Admin → Website; anything left empty is simply not shown. */
export function About({ content }: { content: SiteContent }) {
  const copy = site.about;
  const paragraphs = [content.aboutIntro || copy.fallback, content.aboutMore].filter(Boolean);
  const team = content.team
    .map((entry) => {
      const [name = "", role = ""] = entry.split("|");
      return { name: name.trim(), role: role.trim() };
    })
    .filter((member) => member.name);
  const licensed = content.regulator && content.licenceNumber;
  return (
    <SiteSection id="about" title={copy.heading} tone="alt">
      <div className={team.length > 0 ? "grid grid-cols-1 gap-8 lg:grid-cols-2" : "flex flex-col"}>
        <div className="flex flex-col gap-4">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-prose text-lg text-ink">
              {paragraph}
            </p>
          ))}
          {licensed && (
            <p className="flex items-start gap-2 text-base text-ink-quiet">
              <span className="flex h-6 shrink-0 items-center">
                <ShieldCheck className="size-5 text-brand" aria-hidden />
              </span>
              {copy.licence(content.regulator, content.licenceNumber)}
            </p>
          )}
        </div>
        {team.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg">{copy.teamHeading}</h3>
            <ul className="flex flex-col gap-3">
              {team.map((member) => (
                <li key={member.name} className="flex items-center gap-3">
                  <Avatar name={member.name} className="bg-surface" />
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-ink">{member.name}</span>
                    {member.role && <span className="text-sm text-ink-quiet">{member.role}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SiteSection>
  );
}

/** The insurers on the broker's panel (Admin → Insurers). */
export function Insurers({ panel }: { panel: readonly string[] }) {
  const copy = site.insurers;
  return (
    <SiteSection id="insurers" title={copy.heading} intro={copy.intro}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {panelInsurers(panel).map((insurer) => (
          <li
            key={insurer.id}
            className="flex min-h-touch items-center gap-3 rounded-control border border-border bg-surface px-4 py-3 font-heading text-lg font-semibold text-ink"
          >
            <Avatar name={insurer.name} src={insurer.logo} shape="square" />
            {insurer.name}
          </li>
        ))}
      </ul>
    </SiteSection>
  );
}

/** Invite people to refer clients as agents. */
export function BecomeAgent() {
  const copy = site.agents;
  return (
    <SiteSection id="agents" title={copy.heading}>
      <Card className="gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-prose text-lg text-ink">{copy.body}</p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/agent/join">{copy.join}</Link>
          </Button>
          <TextLink href="/agent/login" standalone>
            {copy.signIn}
          </TextLink>
        </div>
      </Card>
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
