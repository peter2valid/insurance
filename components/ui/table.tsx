import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Data table for admin lists (payments, renewals). Scrolls sideways inside
 * its card on small screens instead of squeezing columns. Numbers use
 * tabular figures so amounts line up.
 */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-surface-alt", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-surface-alt", className)} {...props} />;
}

function TableHeader({ className, numeric, ...props }: React.ComponentProps<"th"> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn("px-4 py-3 text-xs font-medium whitespace-nowrap text-ink-quiet", numeric && "text-right", className)}
      {...props}
    />
  );
}

function TableCell({ className, numeric, ...props }: React.ComponentProps<"td"> & { numeric?: boolean }) {
  return <td className={cn("px-4 py-3 align-middle text-ink", numeric && "text-right tabular-nums whitespace-nowrap", className)} {...props} />;
}

export { Table, TableHead, TableBody, TableRow, TableHeader, TableCell };
