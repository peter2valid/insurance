import { Inbox } from "lucide-react";
import { AdminBoard } from "@/components/admin/admin-board";
import { BoardCard } from "@/components/admin/board-card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { admin } from "@/lib/copy";
import { getBoard, type BoardItem } from "@/lib/data/queries";
import { requestTime } from "@/lib/format/date";

export const metadata = { title: admin.nav.board };

/** Every application in four to-do lists, with search (CLAUDE.md §6, §8.3). */
export default async function ApplicationsPage() {
  const now = requestTime();
  const board = await getBoard(now);
  const quietEmpty = <EmptyState size="compact" icon={Inbox} title={admin.empty.other.title} body={admin.empty.other.body} />;
  const searchText = (item: BoardItem) =>
    [item.client?.name, item.client?.phone, item.application.ref, item.application.details.plate, item.application.details.businessName, item.agent?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  const rows = (bucket: keyof typeof board) =>
    board[bucket].map((item) => ({
      key: item.application.ref,
      search: searchText(item),
      node: <BoardCard item={item} now={now} />,
    }));

  return (
    <AdminBoard
      heading={<PageHeader title={admin.nav.board} description={admin.boardSummary(board.needs_me.length)} />}
      buckets={[
        {
          id: "needs-me",
          title: admin.buckets.needsMe,
          urgent: true,
          items: rows("needs_me"),
          empty: <EmptyState icon={Inbox} title={admin.empty.needsMe.title} body={admin.empty.needsMe.body} />,
        },
        { id: "waiting", title: admin.buckets.waiting, items: rows("waiting"), empty: quietEmpty },
        { id: "quotes-out", title: admin.buckets.quotesOut, items: rows("quotes_out"), empty: quietEmpty },
        { id: "done", title: admin.buckets.done, items: rows("done"), empty: quietEmpty },
      ]}
    />
  );
}
