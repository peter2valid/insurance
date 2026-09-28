"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { addQuoteAction } from "@/app/admin/actions";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { admin, flow } from "@/lib/copy";
import { useAdminAction } from "./action-button";

export type QuoteSuggestion = {
  insurer: string;
  coverType: string;
  premiumKes: number;
  excessKes?: number;
};

/** "Add quote": a short form pre-filled from the QuoteProvider's suggestion. */
export function QuoteDialog({
  refValue,
  suggestion,
  variant = "primary",
}: {
  refValue: string;
  suggestion?: QuoteSuggestion;
  variant?: ButtonProps["variant"];
}) {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending, errors } = useAdminAction(addQuoteAction, () => setOpen(false));
  const copy = admin.quoteForm;
  const format = (n?: number) => (n ? n.toLocaleString("en-KE") : "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Plus aria-hidden />
          {admin.actions.addQuote}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.title} description={copy.description}>
        {/* key resets the form to the latest suggestion each time it opens */}
        <form key={String(open)} action={formAction} noValidate className="flex flex-col gap-4">
          <input type="hidden" name="ref" value={refValue} />
          <Input name="insurer" label={copy.insurer} hint={copy.insurerHint} defaultValue={suggestion?.insurer} error={errors.insurer} />
          <Select
            name="coverType"
            label={copy.coverType}
            options={flow.cover.options}
            defaultValue={suggestion?.coverType}
            error={errors.coverType}
          />
          <Input
            name="premium"
            label={copy.premium}
            prefix={flow.value.prefix}
            inputMode="numeric"
            defaultValue={format(suggestion?.premiumKes)}
            error={errors.premium}
          />
          <Input
            name="excess"
            label={copy.excess}
            prefix={flow.value.prefix}
            inputMode="numeric"
            optional
            defaultValue={format(suggestion?.excessKes)}
            error={errors.excess}
          />
          <Input name="benefits" label={copy.benefits} hint={copy.benefitsHint} optional />
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
