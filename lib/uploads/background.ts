"use client";

import type { DocumentType } from "@/lib/data/types";
import { compressImage } from "@/lib/images/compress";
import { MAX_LOGBOOK_BYTES } from "@/lib/extract/types";

/**
 * Background uploads: the client picks a photo and carries on; the upload
 * finishes while they answer the next question (or browse their status
 * page). A small tray shows progress and offers "Try again" on failure.
 * Survives in-app navigation (it lives in this module, not a component).
 */

export type UploadJob = {
  id: number;
  kind: DocumentType;
  refValue: string;
  label: string;
  successToast: string;
  progress: number;
  state: "uploading" | "done" | "failed";
  errorCode?: string;
  file: File;
};

let jobs: UploadJob[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const doneListeners = new Set<(job: UploadJob) => void>();

const emit = () => listeners.forEach((listener) => listener());
const update = (id: number, patch: Partial<UploadJob>) => {
  jobs = jobs.map((job) => (job.id === id ? { ...job, ...patch } : job));
  emit();
};

export function subscribeUploads(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const getUploads = () => jobs;
const noJobs: UploadJob[] = [];
export const getServerUploads = () => noJobs;

/** Called when any upload finishes (the tray refreshes the page and toasts). */
export function onUploadFinished(listener: (job: UploadJob) => void): () => void {
  doneListeners.add(listener);
  return () => {
    doneListeners.delete(listener);
  };
}

export function dismissUpload(id: number) {
  jobs = jobs.filter((job) => job.id !== id);
  emit();
}

/**
 * Compress and check a file before going on (fast, ~0.2s), so obvious
 * problems show on the current screen instead of failing later.
 */
export async function prepareFile(picked: File): Promise<{ file: File } | { error: string }> {
  if (!picked.type.startsWith("image/") && picked.type !== "application/pdf") return { error: "unsupported_file" };
  const file = await compressImage(picked);
  if (file.size > MAX_LOGBOOK_BYTES) return { error: "too_large" };
  return { file };
}

function send(job: UploadJob) {
  const form = new FormData();
  form.append("file", job.file);
  form.append("kind", job.kind);
  form.append("ref", job.refValue);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");
  xhr.responseType = "json";
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) update(job.id, { progress: Math.min(99, (event.loaded / event.total) * 100) });
  };
  xhr.onerror = () => update(job.id, { state: "failed", errorCode: "upload" });
  xhr.onload = () => {
    const body = xhr.response as { ok?: boolean; code?: string } | null;
    if (body?.ok) {
      update(job.id, { state: "done", progress: 100 });
      const finished = jobs.find((item) => item.id === job.id);
      if (finished) doneListeners.forEach((listener) => listener(finished));
      // Tidy the tray shortly after success.
      setTimeout(() => dismissUpload(job.id), 2500);
    } else {
      update(job.id, { state: "failed", errorCode: body?.code ?? "upload" });
    }
  };
  xhr.send(form);
}

export function startUpload(input: {
  file: File;
  kind: DocumentType;
  refValue: string;
  label: string;
  successToast: string;
}): number {
  const job: UploadJob = { ...input, id: nextId++, progress: 0, state: "uploading" };
  jobs = [...jobs.filter((item) => !(item.kind === input.kind && item.refValue === input.refValue)), job];
  emit();
  send(job);
  return job.id;
}

export function retryUpload(id: number) {
  const job = jobs.find((item) => item.id === id);
  if (!job) return;
  update(id, { state: "uploading", progress: 0, errorCode: undefined });
  send({ ...job, state: "uploading", progress: 0 });
}
