"use client";

import * as React from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { addAgentAction, agentRateAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "@/components/ui/toast";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

/** Copy an agent's referral link. */
export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({ title: admin.agents.copied });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: link, tone: "info" });
    }
  }
  return (
    <Button variant="ghost" onClick={copy}>
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      {admin.agents.copyLink}
    </Button>
  );
}

/** Inline commission rate editor. */
export function RateForm({ agentId, rate }: { agentId: string; rate: number }) {
  const { formAction, pending } = useAdminAction(agentRateAction);
  return (
    <form action={formAction} className="flex items-end gap-2">
      <input type="hidden" name="agentId" value={agentId} />
      <div className="w-28">
        <Input name="rate" label={admin.agents.rate} inputMode="decimal" defaultValue={String(rate)} />
      </div>
      <Button type="submit" variant="secondary" loading={pending}>
        {admin.agents.saveRate}
      </Button>
    </form>
  );
}

/** "Add an agent": they can sign in at once. */
export function AddAgentDialog() {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending, errors, submitted } = useAdminAction(addAgentAction, () => setOpen(false));
  const copy = admin.agents.addForm;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden />
          {admin.agents.add}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.title} description={copy.description}>
        <form action={formAction} noValidate className="flex flex-col gap-4">
          <Input name="name" label={copy.name} autoComplete="off" defaultValue={submitted.name} error={errors.name} />
          <PhoneInput name="phone" label={copy.phone} autoComplete="off" defaultValue={submitted.phone} error={errors.phone} />
          <Input name="email" type="email" label={copy.email} autoComplete="off" defaultValue={submitted.email} error={errors.email} />
          <Input name="code" label={copy.code} hint={copy.codeHint} autoComplete="off" defaultValue={submitted.code} error={errors.code} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{copy.cancel}</Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {copy.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
