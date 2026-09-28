import { Circle, CircleCheck, CircleDot } from "lucide-react";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";

type TimelineState = "done" | "current" | "upcoming";

type TimelineItem = {
  id: string;
  label: string;
  state: TimelineState;
  /** e.g. a formatted date, "28 Sep, 10:40" */
  meta?: string;
  description?: string;
};

/** Vertical list of stages. State is shown by icon, text and weight, not colour alone. */
function StatusTimeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon =
          item.state === "done" ? CircleCheck : item.state === "current" ? CircleDot : Circle;

        return (
          <li
            key={item.id}
            className="flex gap-3"
            aria-current={item.state === "current" ? "step" : undefined}
          >
            <div className="flex flex-col items-center">
              <Icon
                className={cn(
                  "size-6 shrink-0",
                  item.state === "done" && "text-success",
                  item.state === "current" && "text-brand",
                  item.state === "upcoming" && "text-ink-quiet",
                )}
                aria-hidden
              />
              {!isLast && (
                <span
                  className={cn(
                    "my-1 w-px flex-1",
                    item.state === "done" ? "bg-success" : "bg-border",
                  )}
                  aria-hidden
                />
              )}
            </div>
            <div className={cn("flex flex-col gap-1", !isLast && "pb-6")}>
              <p
                className={cn(
                  "text-base",
                  item.state === "current" && "font-semibold text-ink",
                  item.state === "done" && "text-ink",
                  item.state === "upcoming" && "text-ink-quiet",
                )}
              >
                {item.label}
                <span className="sr-only"> — {kit.timeline[item.state]}</span>
              </p>
              {item.state === "current" && (
                <p className="text-sm font-medium text-brand">{kit.timeline.current}</p>
              )}
              {item.meta && <p className="text-sm text-ink-quiet">{item.meta}</p>}
              {item.description && (
                <p className="max-w-prose text-sm text-ink-quiet">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { StatusTimeline };
export type { TimelineItem, TimelineState };
