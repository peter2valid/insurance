import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/* Borders over shadows (CLAUDE.md §4.1). */
const cardVariants = cva("flex flex-col gap-4 rounded-card border p-4 sm:p-6", {
  variants: {
    tone: {
      default: "border-border bg-surface",
      alt: "border-transparent bg-surface-alt",
    },
    interactive: {
      true: "transition-colors hover:border-brand",
      false: "",
    },
  },
  defaultVariants: { tone: "default", interactive: false },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /** Render as the child element, e.g. a Link for a clickable card. */
    asChild?: boolean;
  };

function Card({ className, tone, interactive, asChild, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ tone, interactive }), className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-lg", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-base text-ink-quiet", className)} {...props} />;
}

export { Card, CardTitle, CardDescription, cardVariants };
