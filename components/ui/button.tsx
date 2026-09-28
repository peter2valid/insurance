import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/*
 * One primary button per screen (CLAUDE.md §4.2). Every size keeps the
 * 44px touch target. Label says exactly what happens ("Send code").
 */
const buttonVariants = cva(
  "inline-flex min-h-touch shrink-0 items-center justify-center gap-2 rounded-control border px-4 py-2 text-center text-base font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-brand text-on-brand hover:bg-brand-dark active:bg-brand-dark",
        secondary:
          "border-border bg-surface text-ink hover:border-brand hover:bg-surface-alt active:bg-surface-alt",
        ghost:
          "border-transparent bg-transparent text-brand hover:bg-surface-alt active:bg-surface-alt",
        danger:
          "border-transparent bg-danger text-on-brand hover:opacity-90 active:opacity-90",
      },
      size: {
        default: "",
        icon: "w-touch px-0",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      block: false,
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, keeps the label, and blocks repeat clicks. */
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={asChild ? undefined : disabled}
      // Default to "button" so kit buttons never submit a form by accident.
      type={asChild ? undefined : (type ?? "button")}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <LoaderCircle className="animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
