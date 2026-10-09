"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "@/components/ui/toast";
import { admin } from "@/lib/copy";
import { compressImage } from "@/lib/images/compress";

type ErrorCode = keyof typeof admin.website.errors;

/** Upload, preview and remove the home page hero picture. */
export function HeroImageForm({ imageId }: { imageId: string }) {
  const router = useRouter();
  const copy = admin.website;
  const [state, setState] = React.useState<"empty" | "uploading" | "error">("empty");
  const [error, setError] = React.useState<string>();
  const [removing, setRemoving] = React.useState(false);

  async function upload(original: File) {
    setState("uploading");
    setError(undefined);
    try {
      const file = await compressImage(original);
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/hero", { method: "POST", body });
      const result = (await response.json().catch(() => ({ ok: false, code: "upload" }))) as { ok: boolean; code?: ErrorCode };
      if (!result.ok) {
        setError(copy.errors[result.code ?? "upload"] ?? copy.errors.upload);
        setState("error");
        return;
      }
      toast({ title: copy.uploaded, tone: "success" });
      setState("empty");
      router.refresh();
    } catch {
      setError(copy.errors.upload);
      setState("error");
    }
  }

  async function remove() {
    setRemoving(true);
    const response = await fetch("/api/admin/hero", { method: "DELETE" }).catch(() => null);
    setRemoving(false);
    if (!response?.ok) {
      toast({ title: copy.errors.upload, tone: "error" });
      return;
    }
    toast({ title: copy.removed, tone: "success" });
    router.refresh();
  }

  return (
    <Card className="gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-lg font-semibold">{copy.heroHeading}</h2>
        <p className="max-w-prose text-sm text-ink-quiet">{copy.heroBody}</p>
      </div>

      {imageId ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-ink">{copy.preview}</p>
          <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-control border border-border bg-brand">
            <Image src={`/hero-image/${imageId}`} alt="" fill sizes="(min-width: 768px) 576px, 100vw" className="object-cover opacity-40" />
          </div>
          <Button variant="secondary" className="self-start" loading={removing} onClick={remove}>
            <Trash2 aria-hidden />
            {copy.remove}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-ink-quiet">{copy.noHero}</p>
      )}

      <FileUpload
        label={copy.heroLabel}
        hint={copy.heroHint}
        accept="image/jpeg,image/png,image/webp"
        state={state}
        progress={state === "uploading" ? 60 : 0}
        error={error}
        onSelect={upload}
      />
    </Card>
  );
}
