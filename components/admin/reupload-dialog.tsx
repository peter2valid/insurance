"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { reuploadAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ChoiceCards } from "@/components/ui/choice-cards";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

/** "Ask for re-upload": pick a pre-written reason; the client gets it on WhatsApp (simulated). */
export function ReuploadDialog({ refValue, documentId, documentName }: { refValue: string; documentId: string; documentName: string }) {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending, errors } = useAdminAction(reuploadAction, () => setOpen(false));
  const copy = admin.reupload;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <RefreshCw aria-hidden />
          {admin.actions.askReupload}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.title(documentName)} description={copy.description}>
        <form action={formAction} className="flex flex-col gap-6">
          <input type="hidden" name="ref" value={refValue} />
          <input type="hidden" name="documentId" value={documentId} />
          <ChoiceCards
            name="reason"
            label={copy.reasonLabel}
            options={copy.reasons.map((reason) => ({ value: reason.value, label: reason.label, description: reason.message }))}
            error={errors.reason}
          />
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
