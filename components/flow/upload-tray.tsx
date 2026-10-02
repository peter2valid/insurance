"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, CircleCheck, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { flow } from "@/lib/copy";
import {
  dismissUpload,
  getServerUploads,
  getUploads,
  onUploadFinished,
  retryUpload,
  subscribeUploads,
} from "@/lib/uploads/background";

/**
 * Small progress pill for background uploads, mounted once in the root
 * layout. When an upload finishes it shows a tick and refreshes the page's
 * data, so the status page (or review screen) shows the document received.
 */
export function UploadTray() {
  const router = useRouter();
  const jobs = React.useSyncExternalStore(subscribeUploads, getUploads, getServerUploads);
  const copy = flow.background;

  React.useEffect(
    () =>
      // The pill itself shows the tick; just refresh so the page shows it received.
      onUploadFinished(() => router.refresh()),
    [router],
  );

  if (jobs.length === 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 flex flex-col gap-2 sm:right-auto sm:w-full sm:max-w-dialog" aria-live="polite">
      {jobs.map((job) => {
        const errors = flow.id.errors as Record<string, string>;
        return (
          <Card key={job.id} className="gap-2 p-3 shadow-overlay sm:p-3">
            <div className="flex items-center gap-3">
              {job.state === "uploading" && <LoaderCircle className="size-5 shrink-0 animate-spin text-brand" aria-hidden />}
              {job.state === "done" && <CircleCheck className="size-5 shrink-0 text-success" aria-hidden />}
              {job.state === "failed" && <CircleAlert className="size-5 shrink-0 text-danger" aria-hidden />}
              <p className="min-w-0 flex-1 text-sm font-medium text-ink">
                {job.state === "done" ? job.successToast : copy.uploading(job.label)}
                {job.state === "uploading" && <span className="font-normal text-ink-quiet"> · {Math.round(job.progress)}%</span>}
              </p>
              {job.state === "failed" && (
                <Button variant="ghost" size="icon" aria-label={copy.dismiss} onClick={() => dismissUpload(job.id)}>
                  <X aria-hidden />
                </Button>
              )}
            </div>
            {job.state === "uploading" && <ProgressBar value={job.progress} label={copy.uploading(job.label)} />}
            {job.state === "failed" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-danger">{errors[job.errorCode ?? "upload"] ?? errors.upload}</p>
                <Button variant="secondary" className="self-start" onClick={() => retryUpload(job.id)}>
                  {copy.retry}
                </Button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
