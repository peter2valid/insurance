"use client";

import * as React from "react";
import { Check, Copy, LogOut, MessageCircle } from "lucide-react";
import { agentJoin, agentSendCode, agentSignOut, agentVerifyCode } from "@/app/agent/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { TextLink } from "@/components/ui/text-link";
import { toast } from "@/components/ui/toast";
import { agent } from "@/lib/copy";

export function AgentPhoneForm() {
  const { formAction, pending, errors, submitted } = useFlowAction(agentSendCode);
  const copy = agent.login;
  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <PhoneInput name="phone" label={copy.phoneLabel} defaultValue={submitted.phone} error={errors.phone} autoFocus />
      <Button type="submit" loading={pending}>
        {copy.send}
      </Button>
    </form>
  );
}

export function AgentCodeForm() {
  const { formAction, pending, errors } = useFlowAction(agentVerifyCode);
  const [code, setCode] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const copy = agent.login;
  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="code" value={code} />
      <OtpInput
        label={copy.codeLabel}
        hint={copy.codeHint}
        error={errors.code}
        value={code}
        onChange={setCode}
        onComplete={() => setTimeout(() => formRef.current?.requestSubmit(), 0)}
        autoFocus
      />
      <Button type="submit" loading={pending}>
        {copy.confirm}
      </Button>
      <TextLink href="/agent/login" standalone className="text-sm">
        {copy.changeNumber}
      </TextLink>
    </form>
  );
}

export function AgentJoinForm() {
  const { formAction, pending, errors, submitted } = useFlowAction(agentJoin);
  const copy = agent.join;
  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input name="name" label={copy.name} autoComplete="name" defaultValue={submitted.name} error={errors.name} />
      <PhoneInput name="phone" label={copy.phone} hint={copy.phoneHint} defaultValue={submitted.phone} error={errors.phone} />
      <Input name="email" type="email" label={copy.email} autoComplete="email" defaultValue={submitted.email} error={errors.email} />
      <Button type="submit" loading={pending}>
        {copy.action}
      </Button>
    </form>
  );
}

export function ShareLink({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = agent.dashboard;
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: copy.copied });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: link, tone: "info" });
    }
  }
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button asChild>
        <a href={`https://wa.me/?text=${encodeURIComponent(copy.shareMessage(link))}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden />
          {copy.share}
        </a>
      </Button>
      <Button variant="secondary" onClick={onCopy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copy.copy}
      </Button>
    </div>
  );
}

export function AgentSignOut() {
  const { formAction, pending } = useFlowAction(agentSignOut);
  return (
    <form action={formAction}>
      <Button type="submit" variant="ghost" loading={pending}>
        <LogOut aria-hidden />
        {agent.signOut}
      </Button>
    </form>
  );
}
