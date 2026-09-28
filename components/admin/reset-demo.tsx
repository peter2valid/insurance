"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { resetDemoAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { admin } from "@/lib/copy";
import { useAdminAction } from "./action-button";

/**
 * Admin-only demo tool (CLAUDE.md §11 Stage 10): restore the seed data.
 * Behind a confirmation because it throws away everything from the demo.
 */
export function ResetDemo() {
  const [open, setOpen] = React.useState(false);
  const { formAction, pending } = useAdminAction(resetDemoAction, () => setOpen(false));
  const copy = admin.demo;

  return (
    <Card tone="alt" className="gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-base font-semibold">{copy.heading}</h2>
        <p className="max-w-prose text-sm text-ink-quiet">{copy.body}</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <RotateCcw aria-hidden />
            {copy.reset}
          </Button>
        </DialogTrigger>
        <DialogContent title={copy.confirmTitle} description={copy.confirmBody}>
          <form action={formAction}>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">{copy.cancel}</Button>
              </DialogClose>
              <Button type="submit" variant="danger" loading={pending}>
                {copy.reset}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
