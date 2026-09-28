import Link from "next/link";
import { SearchX } from "lucide-react";
import { MessagePage } from "@/components/site/message-page";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { common } from "@/lib/copy";

/** Branded 404: says what happened and where to go next. */
export default function NotFound() {
  return (
    <MessagePage helpLabel={common.help} helpMessage={common.helpMessage}>
      <EmptyState
        icon={SearchX}
        title={common.notFound.title}
        body={common.notFound.body}
        action={
          <Button asChild>
            <Link href="/">{common.notFound.action}</Link>
          </Button>
        }
      />
    </MessagePage>
  );
}
