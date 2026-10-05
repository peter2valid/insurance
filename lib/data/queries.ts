import { renewalsDue, daysLeft } from "@/lib/automation";
import { getRepo } from "./repo";
import { buildBoard, type BoardEntry, type Bucket } from "./rules";
import type { Agent, Application, Client, Commission, Payment, Quote } from "./types";

/**
 * Read models for screens, composed from the Repo interface only — so they
 * work unchanged when Supabase replaces the mock.
 */

export type BoardItem = BoardEntry & {
  client: Client | null;
  agent?: Agent | null;
  /** The quote the client chose, when there is one. */
  chosen?: Quote;
  payment?: Payment;
};

async function clientsById(apps: Application[]): Promise<Map<string, Client>> {
  const repo = getRepo();
  const ids = [...new Set(apps.map((app) => app.clientId))];
  const clients = await Promise.all(ids.map((id) => repo.getClient(id)));
  return new Map(clients.filter((client): client is Client => client !== null).map((client) => [client.id, client]));
}

export async function getBoard(now: number = Date.now()): Promise<Record<Bucket, BoardItem[]>> {
  const repo = getRepo();
  const [applications, messages, agents, payments] = await Promise.all([
    repo.listApplications(),
    repo.listMessages(),
    repo.listAgents(),
    repo.listPayments(),
  ]);
  const board = buildBoard(applications, messages, now);
  const clients = await clientsById(applications);
  const agentById = new Map(agents.map((agent) => [agent.id, agent]));

  // Chosen quotes, for "Paid KES …" / "waiting for KES …" notes.
  const needQuotes = applications.filter((app) => ["cover_chosen", "paid"].includes(app.status));
  const chosen = new Map(
    (await Promise.all(needQuotes.map(async (app) => [app.ref, (await repo.listQuotes(app.ref)).find((q) => q.chosen)] as const))).filter(
      (entry): entry is readonly [string, Quote] => Boolean(entry[1]),
    ),
  );

  const withExtras = (entry: BoardEntry): BoardItem => ({
    ...entry,
    client: clients.get(entry.application.clientId) ?? null,
    agent: entry.application.agentId ? (agentById.get(entry.application.agentId) ?? null) : undefined,
    chosen: chosen.get(entry.application.ref),
    payment: payments.filter((payment) => payment.applicationRef === entry.application.ref).at(-1),
  });

  return {
    needs_me: board.needs_me.map(withExtras),
    waiting: board.waiting.map(withExtras),
    quotes_out: board.quotes_out.map(withExtras),
    done: board.done.map(withExtras),
  };
}

export type ApplicationView = {
  application: Application;
  client: Client | null;
};

export async function getApplicationView(ref: string): Promise<ApplicationView | null> {
  const repo = getRepo();
  const application = await repo.getApplication(ref);
  if (!application) return null;
  return { application, client: await repo.getClient(application.clientId) };
}

export type NavCounts = { needsMe: number; agentRequests: number; renewals: number };

export async function getNavCounts(now: number = Date.now()): Promise<NavCounts> {
  const repo = getRepo();
  const [applications, messages, agents] = await Promise.all([repo.listApplications(), repo.listMessages(), repo.listAgents()]);
  const board = buildBoard(applications, messages, now);
  return {
    needsMe: board.needs_me.length,
    agentRequests: agents.filter((agent) => agent.status === "pending").length,
    renewals: renewalsDue(applications, now, 14).length,
  };
}

const startOfMonth = (now: number) => {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
};

export type Dashboard = {
  collectedKes: number;
  collectedCount: number;
  awaitingKes: number;
  awaitingCount: number;
  commissionOwedKes: number;
  commissionOwedCount: number;
  renewalsCount: number;
  pipeline: { applying: number; new: number; quotes: number; payment: number; issue: number; covered: number };
};

export async function getDashboard(now: number = Date.now()): Promise<Dashboard> {
  const repo = getRepo();
  const [applications, payments, commissions] = await Promise.all([
    repo.listApplications(),
    repo.listPayments(),
    repo.listCommissions(),
  ]);
  const monthStart = startOfMonth(now);
  const paidThisMonth = payments.filter((p) => p.status === "paid" && p.paidAt && Date.parse(p.paidAt) >= monthStart);
  const awaiting = applications.filter((app) => app.status === "cover_chosen");
  const awaitingKes = (
    await Promise.all(awaiting.map(async (app) => (await repo.listQuotes(app.ref)).find((q) => q.chosen)?.premiumKes ?? 0))
  ).reduce((sum, n) => sum + n, 0);
  const owed = commissions.filter((c) => c.status !== "paid");
  const count = (test: (app: Application) => boolean) => applications.filter(test).length;

  return {
    collectedKes: paidThisMonth.reduce((sum, p) => sum + p.amountKes, 0),
    collectedCount: paidThisMonth.length,
    awaitingKes,
    awaitingCount: awaiting.length,
    commissionOwedKes: owed.reduce((sum, c) => sum + c.amountKes, 0),
    commissionOwedCount: owed.length,
    renewalsCount: renewalsDue(applications, now).length,
    pipeline: {
      applying: count((app) => !app.submittedAt && now - Date.parse(app.updatedAt) < 7 * 86_400_000),
      new: count((app) => Boolean(app.submittedAt) && ["received", "documents_checked", "preparing_quotes", "needs_info"].includes(app.status)),
      quotes: count((app) => app.status === "quotes_ready"),
      payment: count((app) => app.status === "cover_chosen"),
      issue: count((app) => app.status === "paid"),
      covered: count((app) => app.status === "covered" && Boolean(app.policy) && Date.parse(app.policy!.startsAt) >= monthStart),
    },
  };
}

export type PaymentRow = Payment & { client: Client | null; application: Application | null };

export async function getPayments(): Promise<PaymentRow[]> {
  const repo = getRepo();
  const [payments, applications] = await Promise.all([repo.listPayments(), repo.listApplications()]);
  const apps = new Map(applications.map((app) => [app.ref, app]));
  const clients = await clientsById(applications);
  return payments
    .map((payment) => {
      const application = apps.get(payment.applicationRef) ?? null;
      return { ...payment, application, client: application ? (clients.get(application.clientId) ?? null) : null };
    })
    .sort((a, b) => Date.parse(b.paidAt ?? b.createdAt) - Date.parse(a.paidAt ?? a.createdAt));
}

export type CoverRow = { application: Application; client: Client | null; daysLeft: number };

export async function getCovers(now: number = Date.now()): Promise<CoverRow[]> {
  const repo = getRepo();
  const applications = (await repo.listApplications()).filter((app) => app.status === "covered" && app.policy);
  const clients = await clientsById(applications);
  return applications
    .map((application) => ({
      application,
      client: clients.get(application.clientId) ?? null,
      daysLeft: daysLeft(application.policy!.endsAt, now),
    }))
    .filter((row) => row.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export type AgentRow = Agent & {
  clients: number;
  covered: number;
  owedKes: number;
  paidKes: number;
  commissions: Commission[];
};

export async function getAgentRows(): Promise<AgentRow[]> {
  const repo = getRepo();
  const [agents, applications, commissions] = await Promise.all([repo.listAgents(), repo.listApplications(), repo.listCommissions()]);
  return agents.map((agent) => agentStats(agent, applications, commissions));
}

export function agentStats(agent: Agent, applications: Application[], commissions: Commission[]): AgentRow {
  const mine = applications.filter((app) => app.agentId === agent.id);
  const theirs = commissions.filter((c) => c.agentId === agent.id);
  return {
    ...agent,
    clients: new Set(mine.map((app) => app.clientId)).size,
    covered: mine.filter((app) => app.status === "covered").length,
    owedKes: theirs.filter((c) => c.status !== "paid").reduce((sum, c) => sum + c.amountKes, 0),
    paidKes: theirs.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amountKes, 0),
    commissions: theirs,
  };
}
