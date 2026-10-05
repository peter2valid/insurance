"use client";

import { ShieldCheck } from "lucide-react";
import { adminSignInAction } from "@/app/admin/actions";
import { useFlowAction } from "@/components/flow/use-flow-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { brand } from "@/lib/brand";
import { admin } from "@/lib/copy";

export function AdminLoginForm() {
  const { formAction, pending, errors } = useFlowAction(adminSignInAction);
  const copy = admin.login;
  return (
    <Card className="w-full max-w-dialog gap-6">
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 font-heading text-lg font-semibold text-brand">
          <ShieldCheck className="size-6" aria-hidden />
          {brand.name}
        </p>
        <h1 className="text-2xl">{copy.title}</h1>
        <p className="text-base text-ink-quiet">{copy.description}</p>
      </div>
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <Input name="password" type="password" label={copy.password} autoComplete="current-password" error={errors.password} autoFocus />
        <Button type="submit" loading={pending}>
          {copy.action}
        </Button>
      </form>
    </Card>
  );
}
