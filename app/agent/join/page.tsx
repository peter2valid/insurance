import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { AgentJoinForm } from "@/components/agent/agent-forms";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { agent } from "@/lib/copy";

export const metadata = { title: agent.join.title };

/** "Become an agent": a short application the broker approves. */
export default async function AgentJoinPage(props: PageProps<"/agent/join">) {
  const sent = (await props.searchParams).sent === "1";
  const copy = agent.join;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-flow items-center px-4 py-2">
          <Logo />
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-6 px-4 py-8 md:py-12">
        {sent ? (
          <div className="flex flex-col gap-4">
            <CircleCheck className="size-12 text-success" aria-hidden />
            <h1 className="text-2xl md:text-3xl">{copy.doneTitle}</h1>
            <p className="max-w-prose text-base text-ink-quiet">{copy.doneBody}</p>
            <Button asChild className="self-start">
              <Link href="/agent/login">{copy.doneAction}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl">{copy.title}</h1>
              <p className="max-w-prose text-base text-ink-quiet">{copy.description}</p>
            </div>
            <ol className="flex list-decimal flex-col gap-2 pl-6 text-base text-ink">
              {copy.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Card className="max-w-md">
              <AgentJoinForm />
            </Card>
            <TextLink href="/agent/login" standalone>
              {copy.signIn}
            </TextLink>
          </>
        )}
      </main>
    </div>
  );
}
