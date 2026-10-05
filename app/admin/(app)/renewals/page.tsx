import { Bell, CalendarClock } from "lucide-react";
import { remindRenewalAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { PageHeader, Section } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextLink } from "@/components/ui/text-link";
import { admin, coverLabels, productNames } from "@/lib/copy";
import { getCovers, type CoverRow } from "@/lib/data/queries";
import { formatDate, requestTime } from "@/lib/format/date";

export const metadata = { title: admin.nav.renewals };

/** Covers ending soon (with reminders scheduled), then every active cover. */
export default async function RenewalsPage() {
  const covers = await getCovers(requestTime());
  const copy = admin.renewals;
  const soon = covers.filter((row) => row.daysLeft <= 30);

  const table = (rows: CoverRow[], withAction: boolean) => (
    <Card className="gap-0 overflow-hidden p-0 sm:p-0">
      <Table>
        <TableHead>
          <tr>
            <TableHeader>{copy.columns.client}</TableHeader>
            <TableHeader>{copy.columns.cover}</TableHeader>
            <TableHeader>{copy.columns.ends}</TableHeader>
            <TableHeader numeric>{copy.columns.left}</TableHeader>
            {withAction && <TableHeader className="sr-only">{copy.remind}</TableHeader>}
          </tr>
        </TableHead>
        <TableBody>
          {rows.map(({ application: app, client, daysLeft }) => (
            <TableRow key={app.ref}>
              <TableCell>
                <div className="flex flex-col">
                  <TextLink href={`/admin/${app.ref}`} className="font-medium">
                    {client?.name || admin.noName}
                  </TextLink>
                  <span className="text-xs text-ink-quiet">
                    {app.ref}
                    {app.details.plate ? ` · ${app.details.plate}` : ` · ${productNames[app.product]}`}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{app.policy!.insurer}</span>
                  <span className="text-xs text-ink-quiet">{coverLabels[app.policy!.coverType] ?? app.policy!.coverType}</span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(app.policy!.endsAt)}</TableCell>
              <TableCell numeric>
                {daysLeft <= 7 ? <StatusBadge tone="warn" label={copy.daysLeft(daysLeft)} /> : copy.daysLeft(daysLeft)}
              </TableCell>
              {withAction && (
                <TableCell className="text-right">
                  <ActionButton action={remindRenewalAction} fields={{ ref: app.ref }} label={copy.remind} icon={<Bell aria-hidden />} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <>
      <PageHeader title={copy.heading} description={copy.intro} />
      <Section title={copy.soon}>
        {soon.length > 0 ? table(soon, true) : <EmptyState size="compact" icon={CalendarClock} title={copy.empty.title} body={copy.empty.body} />}
      </Section>
      <Section title={copy.later}>
        {covers.length > 0 ? table(covers, false) : <EmptyState size="compact" icon={CalendarClock} title={copy.emptyAll.title} body={copy.emptyAll.body} />}
      </Section>
    </>
  );
}
