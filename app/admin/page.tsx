import { Inbox, MessageCircle } from "lucide-react";
import { AdminBoard } from "@/components/admin/admin-board";
import { ApplicationCard } from "@/components/admin/application-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { admin } from "@/lib/copy";

// Stage 3 placeholder content inside the AdminBoard template.
// Real buckets from the data layer arrive in Stage 8.
export default function AdminBoardPage() {
  const p = admin.placeholder;
  const empty = (
    <EmptyState
      size="compact"
      icon={Inbox}
      title={admin.empty.other.title}
      body={admin.empty.other.body}
    />
  );

  return (
    <AdminBoard
      heading={admin.boardHeading}
      intro={admin.boardIntro}
      buckets={[
        {
          id: "needs-me",
          title: admin.buckets.needsMe,
          urgent: true,
          empty: (
            <EmptyState
              icon={Inbox}
              title={admin.empty.needsMe.title}
              body={admin.empty.needsMe.body}
            />
          ),
          items: p.items.map((item) => (
            <ApplicationCard
              key={item.ref}
              href={`/admin/${item.ref}`}
              name={item.name}
              reference={item.ref}
              vehicle={item.vehicle}
              note={item.note}
              badge={
                item.badge === "new" ? (
                  <StatusBadge tone="new" label={p.badges.new} />
                ) : (
                  <StatusBadge tone="warn" label={p.badges.stalled} />
                )
              }
              action={
                item.badge === "stalled" ? (
                  <Button variant="secondary">
                    <MessageCircle aria-hidden />
                    {admin.actions.nudge}
                  </Button>
                ) : undefined
              }
            />
          )),
        },
        {
          id: "waiting",
          title: admin.buckets.waiting,
          empty,
          items: [
            <ApplicationCard
              key={p.waitingItem.ref}
              href={`/admin/${p.waitingItem.ref}`}
              name={p.waitingItem.name}
              reference={p.waitingItem.ref}
              vehicle={p.waitingItem.vehicle}
              note={p.waitingItem.note}
              badge={<StatusBadge status="needs_info" />}
            />,
          ],
        },
        { id: "quotes-out", title: admin.buckets.quotesOut, empty, items: [] },
        { id: "done", title: admin.buckets.done, empty, items: [] },
      ]}
    />
  );
}
