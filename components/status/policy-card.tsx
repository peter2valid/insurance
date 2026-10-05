"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { renewCover } from "@/app/my/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { coverLabels, statusPage } from "@/lib/copy";
import type { Policy } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";

/**
 * The client's cover once it's issued: insurer, policy and certificate
 * numbers, dates, and — when it's ending soon — "Renew now".
 */
export function PolicyCard({
  refValue,
  policy,
  daysLeft,
  receipt,
}: {
  refValue: string;
  policy: Policy;
  daysLeft: number;
  receipt?: string;
}) {
  const copy = statusPage.policy;
  const renew = useFlowAction(renewCover);
  const endingSoon = daysLeft <= 30;
  const rows: [string, string][] = [
    [copy.insurer, policy.insurer],
    [copy.cover, coverLabels[policy.coverType] ?? policy.coverType],
    [copy.policyNumber, policy.policyNumber],
    ...(policy.certificateNumber ? ([[copy.certificate, policy.certificateNumber]] as [string, string][]) : []),
    [copy.period, `${formatDate(policy.startsAt)} – ${formatDate(policy.endsAt)}`],
    [copy.premium, receipt ? `${formatKes(policy.premiumKes)} · ${statusPage.pay.receipt(receipt)}` : formatKes(policy.premiumKes)],
  ];

  return (
    <Card className={endingSoon ? "gap-4 border-2 border-warn" : "gap-4"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-lg font-semibold text-ink">
          <ShieldCheck className="size-6 text-success" aria-hidden />
          {policy.insurer}
        </p>
        {daysLeft < 0 ? (
          <StatusBadge tone="danger" label={copy.ended} />
        ) : (
          endingSoon && <StatusBadge tone="warn" label={copy.endsIn(Math.max(daysLeft, 1))} />
        )}
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-sm text-ink-quiet">{label}</dt>
            <dd className="text-base text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {endingSoon ? (
        <form action={renew.formAction} className="flex flex-col gap-2">
          <input type="hidden" name="ref" value={refValue} />
          <Button type="submit" loading={renew.pending} className="self-start">
            <RefreshCw aria-hidden />
            {copy.renew}
          </Button>
          {renew.errors._form && <FieldError>{renew.errors._form}</FieldError>}
        </form>
      ) : (
        <p className="text-sm text-ink-quiet">{copy.renewNote(formatDate(policy.endsAt))}</p>
      )}
    </Card>
  );
}
