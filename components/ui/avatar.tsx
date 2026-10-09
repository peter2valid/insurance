"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-surface-alt font-medium text-brand",
  {
    variants: {
      /** square: organisations (insurer logos); circle: people. */
      shape: {
        circle: "rounded-full",
        square: "rounded-control border border-border bg-surface",
      },
      size: {
        sm: "size-8 text-xs",
        default: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "default", shape: "circle" },
  },
);

/** "Wanjiku Kamau" -> "WK". Ignores punctuation, so "[Name]" -> "N". */
function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type AvatarProps = VariantProps<typeof avatarVariants> & {
  name: string;
  src?: string;
  className?: string;
};

function Avatar({ name, src, size, shape, className }: AvatarProps) {
  return (
    <AvatarPrimitive.Root className={cn(avatarVariants({ size, shape }), className)}>
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          // Logos sit inside the square with a little room; photos fill the circle.
          className={shape === "square" ? "size-full object-contain p-1" : "size-full object-cover"}
        />
      )}
      <AvatarPrimitive.Fallback aria-label={name} role="img">
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar, initials };
