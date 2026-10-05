import { Banknote, CircleCheck, Pause, Play, Users } from "lucide-react";
import { agentStatusAction, approveAgentAction, payAgentAction } from "@/app/admin/actions";
import { ActionButton } from "@/components/admin/action-button";
import { AddAgentDialog, CopyLinkButton, RateForm } from "@/components/admin/agent-controls";
import { PageHeader, Section } from "@/components/admin/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { TextLink } from "@/components/ui/text-link";
import { referralLink } from "@/lib/admin/workflow";
import { admin } from "@/lib/copy";
import { getAgentRows, type AgentRow } from "@/lib/data/queries";
import type { AgentStatus } from "@/lib/data/types";
import { formatDate } from "@/lib/format/date";
import { formatKes } from "@/lib/format/money";
import { formatKenyanPhone } from "@/lib/format/phone";

export const metadata = { title: admin.nav.agents };

const tone: Record<AgentStatus, BadgeTone> = { pending: "new", active: "success", paused: "neutral" };

/** Agents who refer clients: approve, set commission, pay what's owed. */
export default async function AgentsPage() {
  const rows = await getAgentRows();
  const copy = admin.agents;
  const requests = rows.filter((agent) => agent.status === "pending");
  const agents = rows.filter((agent) => agent.status !== "pending").sort((a, b) => b.owedKes - a.owedKes || b.clients - a.clients);

  return (
    <>
      <PageHeader
        title={copy.heading}
        description={copy.intro}
        actions={
          <>
            <TextLink href="/agent/join" external standalone className="text-sm">
              {copy.signupLink}
            </TextLink>
            <AddAgentDialog />
          </>
        }
      />

      {requests.length > 0 && (
        <Section title={copy.requests}>
          <Card className="gap-0 p-0 sm:p-0">
            <ul className="flex flex-col divide-y divide-border">
              {requests.map((agent) => (
                <li key={agent.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={agent.name} />
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-ink">{agent.name}</span>
                      <span className="text-sm text-ink-quiet">
                        {formatKenyanPhone(agent.phone)} · {formatDate(agent.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ActionButton
                    action={approveAgentAction}
                    fields={{ agentId: agent.id }}
                    label={copy.approve}
                    icon={<CircleCheck aria-hidden />}
                    variant="primary"
                  />
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      <Section title={copy.active}>
        {agents.length === 0 ? (
          <EmptyState icon={Users} title={copy.empty.title} body={copy.empty.body} />
        ) : (
          <ul className="flex flex-col gap-4">
            {agents.map((agent) => (
              <li key={agent.id}>
                <AgentCard agent={agent} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function AgentCard({ agent }: { agent: AgentRow }) {
  const copy = admin.agents;
  const link = referralLink(agent.code);
  return (
    <Card className="gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Avatar name={agent.name} />
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-ink">{agent.name}</span>
              <StatusBadge tone={tone[agent.status]} label={copy.status[agent.status]} />
            </div>
            <span className="text-sm text-ink-quiet">
              {copy.columns.code} {agent.code} · {formatKenyanPhone(agent.phone)}
            </span>
            <span className="text-sm text-ink">{copy.stats(agent.clients, agent.covered)}</span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 md:text-right">
          <div className="flex flex-col">
            <dt className="text-sm text-ink-quiet">{copy.columns.owed}</dt>
            <dd className="font-heading text-xl font-semibold text-ink tabular-nums">{formatKes(agent.owedKes)}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="text-sm text-ink-quiet">{copy.columns.paid}</dt>
            <dd className="font-heading text-xl font-semibold text-ink-quiet tabular-nums">{formatKes(agent.paidKes)}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-end lg:justify-between">
        <RateForm agentId={agent.id} rate={agent.commissionRate} />
        <div className="flex flex-wrap items-center gap-2">
          <CopyLinkButton link={link} />
          <ActionButton
            action={agentStatusAction}
            fields={{ agentId: agent.id, status: agent.status === "paused" ? "active" : "paused" }}
            label={agent.status === "paused" ? copy.resume : copy.pause}
            icon={agent.status === "paused" ? <Play aria-hidden /> : <Pause aria-hidden />}
            variant="ghost"
          />
          {agent.owedKes > 0 && (
            <ActionButton
              action={payAgentAction}
              fields={{ agentId: agent.id }}
              label={copy.pay(formatKes(agent.owedKes))}
              icon={<Banknote aria-hidden />}
              variant="primary"
            />
          )}
        </div>
      </div>
      {agent.owedKes > 0 && <p className="text-xs text-ink-quiet">{copy.payNote}</p>}
    </Card>
  );
}
