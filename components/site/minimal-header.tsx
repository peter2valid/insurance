import { Logo } from "./logo";
import { WhatsAppButton } from "./whatsapp-button";

/**
 * Stripped-down header for the application flow and status page: logo and
 * a way to get help, nothing that pulls the client away from the task.
 */
export function MinimalHeader({
  helpLabel,
  helpMessage,
}: {
  helpLabel: string;
  helpMessage: string;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-flow items-center gap-2 px-4 py-2">
        <Logo />
        <WhatsAppButton
          variant="ghost"
          label={helpLabel}
          message={helpMessage}
          className="ml-auto"
        />
      </div>
    </header>
  );
}
