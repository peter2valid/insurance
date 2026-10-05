import * as React from "react";

/** Title, one line of context and (optionally) the page's actions — the same on every admin page. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {description && <p className="max-w-prose text-base text-ink-quiet">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** A titled section inside an admin page. */
export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex min-h-touch flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-sans text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-ink-quiet">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
