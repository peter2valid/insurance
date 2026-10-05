import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextLink } from "@/components/ui/text-link";
import { admin } from "@/lib/copy";
import { getPayments } from "@/lib/data/queries";
import type { PaymentStatus } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";

export const metadata = { title: admin.nav.payments };

const tone: Record<PaymentStatus, BadgeTone> = { pending: "warn", paid: "success", failed: "danger" };

/** Every M-Pesa payment, newest first, with totals. */
export default async function PaymentsPage() {
  const payments = await getPayments();
  const copy = admin.payments;
  const paid = payments.filter((p) => p.status === "paid");
  const pending = payments.filter((p) => p.status === "pending");
  const sum = (list: typeof payments) => list.reduce((total, p) => total + p.amountKes, 0);

  return (
    <>
      <PageHeader title={copy.heading} description={copy.intro} />
      <Card className="grid grid-cols-2 gap-0 divide-x divide-border p-0 sm:p-0">
        {[
          { label: copy.totals.collected, value: formatKes(sum(paid)), note: copy.totals.count(paid.length) },
          { label: copy.totals.pending, value: formatKes(sum(pending)), note: copy.totals.count(pending.length) },
        ].map((entry) => (
          <div key={entry.label} className="flex flex-col gap-1 p-4 sm:p-6">
            <span className="text-sm text-ink-quiet">{entry.label}</span>
            <span className="font-heading text-2xl font-semibold text-ink tabular-nums">{entry.value}</span>
            <span className="text-xs text-ink-quiet">{entry.note}</span>
          </div>
        ))}
      </Card>

      {payments.length === 0 ? (
        <EmptyState icon={Wallet} title={copy.empty.title} body={copy.empty.body} />
      ) : (
        <Card className="gap-0 overflow-hidden p-0 sm:p-0">
          <Table>
            <TableHead>
              <tr>
                <TableHeader>{copy.columns.client}</TableHeader>
                <TableHeader numeric>{copy.columns.amount}</TableHeader>
                <TableHeader>{copy.columns.receipt}</TableHeader>
                <TableHeader>{copy.columns.status}</TableHeader>
                <TableHeader>{copy.columns.date}</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <TextLink href={`/admin/${payment.applicationRef}`} className="font-medium">
                        {payment.client?.name || admin.noName}
                      </TextLink>
                      <span className="text-xs text-ink-quiet">{payment.applicationRef}</span>
                    </div>
                  </TableCell>
                  <TableCell numeric className="font-medium">
                    {formatKes(payment.amountKes)}
                  </TableCell>
                  <TableCell className="tabular-nums">{payment.receipt ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge tone={tone[payment.status]} label={copy.status[payment.status]} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-quiet">{formatDateTime(payment.paidAt ?? payment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
