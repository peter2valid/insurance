import { Inbox } from "lucide-react";
import { AdminBoard } from "@/components/admin/admin-board";
import { BoardCard } from "@/components/admin/board-card";
import { ResetDemo } from "@/components/admin/reset-demo";
import { EmptyState } from "@/components/ui/empty-state";
import { admin } from "@/lib/copy";
import { requestTime } from "@/lib/format/date";
import { getBoard } from "@/lib/data/queries";

/** Admin home: four to-do lists from live data (CLAUDE.md §6, §8.3). */
export default async function AdminBoardPage() {
  const now = requestTime();
  const board = await getBoard(now);
  const quietEmpty = (
    <EmptyState size="compact" icon={Inbox} title={admin.empty.other.title} body={admin.empty.other.body} />
  );
  const cards = (bucket: keyof typeof board) =>
    board[bucket].map((item) => ({
      key: item.application.ref,
      node: <BoardCard item={item} now={now} />,
    }));

  return (
    <>
      <AdminBoard
        heading={admin.boardHeading}
        summary={admin.boardSummary(board.needs_me.length)}
        buckets={[
          {
            id: "needs-me",
            title: admin.buckets.needsMe,
            urgent: true,
            items: cards("needs_me"),
            empty: <EmptyState icon={Inbox} title={admin.empty.needsMe.title} body={admin.empty.needsMe.body} />,
          },
          { id: "waiting", title: admin.buckets.waiting, items: cards("waiting"), empty: quietEmpty },
          { id: "quotes-out", title: admin.buckets.quotesOut, items: cards("quotes_out"), empty: quietEmpty },
          { id: "done", title: admin.buckets.done, items: cards("done"), empty: quietEmpty },
        ]}
      />
      <ResetDemo />
    </>
  );
}
