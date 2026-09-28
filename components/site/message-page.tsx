import * as React from "react";
import { MinimalHeader } from "./minimal-header";

/**
 * Shell for whole-page messages (404, unexpected errors): logo, help, and
 * one clear message with what to do next. Uses the same header as the flow.
 */
export function MessagePage({
  helpLabel,
  helpMessage,
  children,
}: {
  helpLabel: string;
  helpMessage: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <MinimalHeader helpLabel={helpLabel} helpMessage={helpMessage} />
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-6 px-4 py-12">
        {children}
      </main>
    </>
  );
}
