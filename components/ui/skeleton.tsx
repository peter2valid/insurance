import { cn } from "@/lib/utils";

/**
 * Placeholder shape while content loads. Size it with classes
 * (e.g. "h-4 w-32"). Wrap the loading region in an element with
 * aria-busy="true" so screen readers know it is loading.
 */
function Skeleton({
  shape = "block",
  className,
}: {
  shape?: "line" | "block" | "circle";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      data-slot="skeleton"
      className={cn(
        "block animate-pulse bg-surface-alt",
        shape === "line" && "h-4 rounded-full",
        shape === "block" && "rounded-card",
        shape === "circle" && "rounded-full",
        className,
      )}
    />
  );
}

export { Skeleton };
