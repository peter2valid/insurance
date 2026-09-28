import { getRepo } from "./repo";
import { buildBoard, type BoardEntry, type Bucket } from "./rules";
import type { Application, Client } from "./types";

/**
 * Read models for screens, composed from the Repo interface only — so they
 * work unchanged when Supabase replaces the mock.
 */

export type BoardItem = BoardEntry & { client: Client | null };

export async function getBoard(now: number = Date.now()): Promise<Record<Bucket, BoardItem[]>> {
  const repo = getRepo();
  const [applications, messages] = await Promise.all([repo.listApplications(), repo.listMessages()]);
  const board = buildBoard(applications, messages, now);

  const clientIds = [...new Set(applications.map((app) => app.clientId))];
  const clients = new Map(
    (await Promise.all(clientIds.map((id) => repo.getClient(id))))
      .filter((client): client is Client => client !== null)
      .map((client) => [client.id, client]),
  );

  const withClient = (entry: BoardEntry): BoardItem => ({
    ...entry,
    client: clients.get(entry.application.clientId) ?? null,
  });

  return {
    needs_me: board.needs_me.map(withClient),
    waiting: board.waiting.map(withClient),
    quotes_out: board.quotes_out.map(withClient),
    done: board.done.map(withClient),
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
