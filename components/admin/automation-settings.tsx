"use client";

import { Play } from "lucide-react";
import { runAutomationsAction, saveSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { admin } from "@/lib/copy";
import type { Settings } from "@/lib/data/types";
import { useAdminAction } from "./action-button";

const RULES = ["autoQuote", "nudgeStalled", "remindQuotes", "remindPayment", "renewalReminders"] as const;

/** The automation switches, the default agent commission, and "Run now". */
export function AutomationSettings({ settings }: { settings: Settings }) {
  const save = useAdminAction(saveSettingsAction);
  const runNow = useAdminAction(runAutomationsAction);
  const copy = admin.automations;

  return (
    <div className="flex flex-col gap-4">
      <form action={save.formAction} noValidate className="flex flex-col gap-4">
        <Card className="gap-0 p-0 sm:p-0">
          <ul className="flex flex-col divide-y divide-border">
            {RULES.map((rule) => (
              <li key={rule} className="p-4 sm:px-6">
                <Switch
                  name={rule}
                  label={copy.rules[rule].title}
                  description={copy.rules[rule].body}
                  defaultChecked={settings[rule]}
                  onLabel={copy.on}
                  offLabel={copy.off}
                />
              </li>
            ))}
            <li className="p-4 sm:px-6">
              <div className="max-w-xs">
                <Input
                  name="defaultCommissionRate"
                  label={copy.commissionDefault}
                  inputMode="decimal"
                  defaultValue={save.submitted.defaultCommissionRate ?? String(settings.defaultCommissionRate)}
                  error={save.errors.defaultCommissionRate}
                />
              </div>
            </li>
          </ul>
        </Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" loading={save.pending}>
            {copy.save}
          </Button>
        </div>
      </form>
      <form action={runNow.formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <Button type="submit" variant="secondary" loading={runNow.pending}>
          <Play aria-hidden />
          {copy.runNow}
        </Button>
        <p className="text-sm text-ink-quiet">{copy.runNote}</p>
      </form>
    </div>
  );
}
