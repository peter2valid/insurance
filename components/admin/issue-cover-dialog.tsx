"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { issueCoverAction } from "@/app/admin/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

/** "Issue cover": the policy details from the insurer. The client is told at once. */
export function IssueCoverDialog({
  refValue,
  from,
  variant = "primary",
  today,
}: {
  refValue: string;
  /** "board" / "today": stay on that page afterwards. */
  from?: string;
  variant?: ButtonProps["variant"];
  /** yyyy-mm-dd in Nairobi time, the default start date. */
  today: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending, errors, submitted } = useAdminAction(issueCoverAction, () => setOpen(false));
  const copy = admin.issueForm;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <ShieldCheck aria-hidden />
          {admin.actions.issueCover}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.title} description={copy.description}>
        <form action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="ref" value={refValue} />
          {from && <input type="hidden" name="from" value={from} />}
          <Input name="policyNumber" label={copy.policyNumber} defaultValue={submitted.policyNumber} error={errors.policyNumber} autoFocus />
          <Input
            name="certificateNumber"
            label={copy.certificate}
            hint={copy.certificateHint}
            defaultValue={submitted.certificateNumber}
            error={errors.certificateNumber}
          />
          <Input name="startsOn" type="date" label={copy.startsOn} defaultValue={submitted.startsOn ?? today} error={errors.startsOn} />
          {errors._form && <FieldError>{errors._form}</FieldError>}
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
