import { redirect } from "next/navigation";
import { AgentCodeForm, AgentPhoneForm } from "@/components/agent/agent-forms";
import { Logo } from "@/components/site/logo";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";
import { agent } from "@/lib/copy";
import { getPendingCode, getSessionAgentId } from "@/lib/session";

export const metadata = { title: agent.login.title };

/** Agent sign-in: phone, then the code. */
export default async function AgentLoginPage(props: PageProps<"/agent/login">) {
  if (await getSessionAgentId()) redirect("/agent");
  const step = (await props.searchParams).step;
  const onCode = step === "code" && (await getPendingCode()) !== null;
  const copy = agent.login;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-flow items-center px-4 py-2">
          <Logo />
        </div>
      </header>
      <main id="main" className="mx-auto flex w-full max-w-flow flex-1 flex-col gap-6 px-4 py-8 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl">{copy.title}</h1>
          <p className="max-w-prose text-base text-ink-quiet">{copy.description}</p>
        </div>
        <Card className="max-w-md">{onCode ? <AgentCodeForm /> : <AgentPhoneForm />}</Card>
        <p className="text-base text-ink-quiet">
          {copy.noAccount}{" "}
          <TextLink href="/agent/join">{copy.join}</TextLink>
        </p>
      </main>
    </div>
  );
}
