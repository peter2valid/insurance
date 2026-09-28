"use client";

import { CircleAlert } from "lucide-react";
import { MessagePage } from "@/components/site/message-page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextLink } from "@/components/ui/text-link";
import { common } from "@/lib/copy";

/**
 * Catch-all error screen. Never blames the user, never vague, always
 * offers a way forward (CLAUDE.md §4.3). Details are not shown — they may
 * contain personal data.
 */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <MessagePage helpLabel={common.help} helpMessage={common.helpMessage}>
      <EmptyState
        tone="error"
        icon={CircleAlert}
        title={common.error.title}
        body={common.error.body}
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button onClick={reset}>{common.error.action}</Button>
            <TextLink href="/" standalone>
              {common.error.home}
            </TextLink>
          </div>
        }
      />
    </MessagePage>
  );
}
