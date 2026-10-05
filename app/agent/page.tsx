import { redirect } from "next/navigation";
import { AgentSignOut, ShareLink } from "@/components/agent/agent-forms";
import { Logo } from "@/components/site/logo";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { referralLink } from "@/lib/admin/workflow";
import { agent as copy } from "@/lib/copy";
import { agentStats } from "@/lib/data/queries";
import { getRepo } from "@/lib/data/repo";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { summarizeWithProduct } from "@/lib/products/summary";
import { getSessionAgentId } from "@/lib/session";

export const metadata = { title: copy.title };

/** The agent's own page: their link, their clients and their earnings. */
export default async function AgentDashboardPage() {
  const agentId = await getSessionAgentId();
  if (!agentId) redirect("/agent/login");
  const repo = getRepo();
  const me = await repo.getAgent(agentId);
  if (!me) redirect("/agent/login");

  const [applications, commissions] = await Promise.all([repo.listApplications(), repo.listCommissions(me.id)]);
  const stats = agentStats(me, applications, commissions);
  const mine = applications
    .filter((app) => app.agentId === me.id)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const clients = new Map(
    (await Promise.all([...new Set(mine.map((app) => app.clientId))].map((id) => repo.getClient(id)))).flatMap((client) =>
      client ? [[client.id, client] as const] : [],
    ),
  );
  const d = copy.dashboard;
  const firstName = me.name.split(" ")[0];
  const link = referralLink(me.code);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-2 px-4 py-2">
          <Logo href="/agent" />
          <AgentSignOut />
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-page flex-1 flex-col gap-6 px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl">{d.greeting(firstName)}</h1>

        {me.status === "pending" ? (
          <Card tone="alt" className="gap-2">
            <h2 className="font-sans text-lg font-semibold">{d.pendingTitle}</h2>
            <p className="text-base text-ink-quiet">{d.pendingBody}</p>
          </Card>
        ) : (
          <>
            {me.status === "paused" && (
              <Card tone="alt" className="gap-2">
                <h2 className="font-sans text-lg font-semibold">{d.pausedTitle}</h2>
                <p className="text-base text-ink-quiet">{d.pausedBody}</p>
              </Card>
            )}
            <Card className="gap-4 border-2 border-brand">
              <div className="flex flex-col gap-1">
                <h2 className="font-sans text-lg font-semibold">{d.linkHeading}</h2>
                <p className="text-base text-ink-quiet">{d.linkBody(`${me.commissionRate}%`)}</p>
              </div>
              <p className="rounded-control bg-surface-alt px-3 py-2 text-base break-all text-ink">{link}</p>
              <p className="text-sm text-ink-quiet">{d.code(me.code)}</p>
              <ShareLink link={link} />
            </Card>

            <Card className="grid grid-cols-2 gap-0 divide-border p-0 sm:p-0 lg:grid-cols-4 lg:divide-x">
              {[
                { label: d.stats.clients, value: String(stats.clients) },
                { label: d.stats.covered, value: String(stats.covered) },
                { label: d.stats.owed, value: formatKes(stats.owedKes) },
                { label: d.stats.paid, value: formatKes(stats.paidKes) },
              ].map((entry) => (
                <div key={entry.label} className="flex flex-col gap-1 p-4 sm:p-6">
                  <span className="text-sm text-ink-quiet">{entry.label}</span>
                  <span className="font-heading text-2xl font-semibold text-ink tabular-nums">{entry.value}</span>
                </div>
              ))}
            </Card>

            <section className="flex flex-col gap-3">
              <h2 className="font-sans text-lg font-semibold">{d.clientsHeading}</h2>
              {mine.length === 0 ? (
                <Card tone="alt">
                  <p className="text-base text-ink-quiet">{d.clientsEmpty}</p>
                </Card>
              ) : (
                <Card className="gap-0 p-0 sm:p-0">
                  <ul className="flex flex-col divide-y divide-border">
                    {mine.map((app) => {
                      const client = clients.get(app.clientId);
                      const commission = commissions.find((c) => c.applicationRef === app.ref);
                      return (
                        <li key={app.ref} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-base font-medium text-ink">{client?.name || app.ref}</span>
                            <span className="text-sm text-ink-quiet">
                              {summarizeWithProduct(app)} · {formatDate(app.updatedAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {app.submittedAt && <StatusBadge status={app.status} />}
                            {commission ? (
                              <StatusBadge
                                tone={commission.status === "paid" ? "success" : "new"}
                                label={`${d.commission(formatKes(commission.amountKes))} · ${commission.status === "paid" ? d.commissionPaid : d.commissionOwed}`}
                              />
                            ) : (
                              <span className="text-sm text-ink-quiet">{app.submittedAt ? d.noCommissionYet : d.applying}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              )}
              <p className="text-sm text-ink-quiet">{d.payoutsNote}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
