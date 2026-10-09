"use client";

import { TriangleAlert } from "lucide-react";
import { savePanelAction } from "@/app/admin/actions";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

export type PanelRow = {
  id: string;
  name: string;
  legalName: string;
  logo?: string;
  /** "All vehicle classes · Comprehensive up to 15 years old" */
  terms: string;
  caution?: string;
  on: boolean;
};

/** One switch per insurer: on means clients get instant quotes from it. */
export function InsurerPanel({ rows }: { rows: PanelRow[] }) {
  const save = useAdminAction(savePanelAction);
  const copy = admin.insurers;

  return (
    <form action={save.formAction} className="flex flex-col gap-4">
      {save.errors._form && <FieldError>{save.errors._form}</FieldError>}
      <Card className="gap-0 p-0 sm:p-0">
        <ul className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <li key={row.id} className="flex items-start gap-3 p-4 sm:px-6">
              <Avatar name={row.name} src={row.logo} shape="square" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Switch
                  name={`panel_${row.id}`}
                  label={row.name}
                  description={`${row.legalName} · ${row.terms}`}
                  defaultChecked={row.on}
                  onLabel={copy.on}
                  offLabel={copy.off}
                />
                {row.caution && (
                  <p className="flex items-start gap-2 text-sm text-ink">
                    <span className="flex h-5 shrink-0 items-center">
                      <TriangleAlert className="size-4 text-warn" aria-hidden />
                    </span>
                    {row.caution}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Button type="submit" loading={save.pending} className="self-start">
        {copy.save}
      </Button>
    </form>
  );
}
