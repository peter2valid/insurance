"use client";

import * as React from "react";
import { Banknote } from "lucide-react";
import { recordPaymentAction } from "@/app/admin/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

/** For clients who paid in cash, by bank or straight to the paybill. */
export function RecordPaymentDialog({ refValue, variant = "secondary" }: { refValue: string; variant?: ButtonProps["variant"] }) {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending } = useAdminAction(recordPaymentAction, () => setOpen(false));
  const copy = admin.recordPayment;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Banknote aria-hidden />
          {admin.actions.recordPayment}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.title} description={copy.description}>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="ref" value={refValue} />
          <Input name="receipt" label={copy.receipt} hint={copy.receiptHint} autoComplete="off" />
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
