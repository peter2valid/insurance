"use client";

import { saveSiteContentAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { admin } from "@/lib/copy";
import type { SiteContent } from "@/lib/data/types";
import { useAdminAction } from "./action-button";

/** The agency's own words for "About us" and the footer. */
export function SiteContentForm({ content }: { content: SiteContent }) {
  const save = useAdminAction(saveSiteContentAction);
  const copy = admin.website.content;
  const people = [0, 1, 2].map((i) => {
    const [name = "", role = ""] = (content.team[i] ?? "").split("|");
    return { name, role };
  });
  const value = (key: string, saved: string) => save.submitted[key] ?? saved;

  return (
    <Card className="gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-lg font-semibold">{copy.heading}</h2>
        <p className="max-w-prose text-sm text-ink-quiet">{copy.body}</p>
      </div>
      <form action={save.formAction} className="flex flex-col gap-4">
        {save.errors._form && <FieldError>{save.errors._form}</FieldError>}
        <Input name="aboutIntro" label={copy.aboutIntro} hint={copy.aboutIntroHint} optional defaultValue={value("aboutIntro", content.aboutIntro)} />
        <Input name="aboutMore" label={copy.aboutMore} optional defaultValue={value("aboutMore", content.aboutMore)} />

        <fieldset className="flex flex-col gap-3">
          <legend className="pb-2 text-base font-medium text-ink">{copy.teamHeading}</legend>
          {people.map((person, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <Input name={`name${i + 1}`} label={copy.memberName(i + 1)} autoComplete="off" defaultValue={value(`name${i + 1}`, person.name)} />
              <Input name={`role${i + 1}`} label={copy.memberRole(i + 1)} hint={i === 0 ? copy.memberRoleHint : undefined} autoComplete="off" defaultValue={value(`role${i + 1}`, person.role)} />
            </div>
          ))}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="regulator" label={copy.regulator} hint={copy.regulatorHint} optional defaultValue={value("regulator", content.regulator)} />
          <Input name="licenceNumber" label={copy.licenceNumber} hint={copy.licenceHint} optional defaultValue={value("licenceNumber", content.licenceNumber)} />
          <Input name="email" type="email" label={copy.email} optional autoComplete="off" defaultValue={value("email", content.email)} />
          <Input name="hours" label={copy.hours} hint={copy.hoursHint} optional defaultValue={value("hours", content.hours)} />
        </div>
        <Input name="address" label={copy.address} optional defaultValue={value("address", content.address)} />

        <Button type="submit" loading={save.pending} className="self-start">
          {copy.save}
        </Button>
      </form>
    </Card>
  );
}
