"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, Info, type LucideIcon, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { kit } from "@/lib/copy";
import { cn } from "@/lib/utils";

/*
 * Visible confirmation of every action (CLAUDE.md §4.3).
 * Call toast({ title: "Details confirmed" }) from anywhere; render
 * <Toaster /> once in the root layout.
 */

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
};

type ToastItem = ToastInput & { id: number; open: boolean };

// Tiny module-level store so toast() works outside React components.
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

let lastShownAt = 0;

function toast(input: ToastInput) {
  lastShownAt = Date.now();
  items = [...items, { tone: "success", ...input, id: nextId++, open: true }];
  emit();
}

/** Milliseconds since the last toast — lets pages avoid stacking two messages about one change. */
function msSinceLastToast(): number {
  return Date.now() - lastShownAt;
}

function dismiss(id: number) {
  items = items.map((item) => (item.id === id ? { ...item, open: false } : item));
  emit();
  // Remove after the exit transition.
  setTimeout(() => {
    items = items.filter((item) => item.id !== id);
    emit();
  }, 300);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => items;
const noToasts: ToastItem[] = [];
const getServerSnapshot = () => noToasts;

const toneStyle: Record<ToastTone, { icon: LucideIcon; iconClass: string }> = {
  success: { icon: CircleCheck, iconClass: "text-success" },
  error: { icon: CircleAlert, iconClass: "text-danger" },
  info: { icon: Info, iconClass: "text-brand" },
};

/** Presentational toast body; also used on /styles to show each tone. */
function ToastCard({
  title,
  description,
  tone = "success",
  closeButton,
  className,
}: ToastInput & { closeButton?: React.ReactNode; className?: string }) {
  const { icon: Icon, iconClass } = toneStyle[tone];
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-card border border-border bg-surface p-4 shadow-overlay",
        className,
      )}
    >
      <span className="flex h-6 shrink-0 items-center">
        <Icon className={cn("size-5", iconClass)} aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base font-medium text-ink">{title}</p>
        {description && <p className="text-sm text-ink-quiet">{description}</p>}
      </div>
      {closeButton}
    </div>
  );
}

function Toaster() {
  const list = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ToastPrimitive.Provider duration={5000} label={kit.close}>
      {list.map((item) => (
        <ToastPrimitive.Root
          key={item.id}
          open={item.open}
          onOpenChange={(open) => !open && dismiss(item.id)}
          type={item.tone === "error" ? "foreground" : "background"}
          className="data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <ToastCard
            tone={item.tone}
            title={item.title}
            description={item.description}
            closeButton={
              <ToastPrimitive.Close
                aria-label={kit.close}
                className="-my-3 -mr-3 flex size-touch shrink-0 items-center justify-center rounded-control text-ink-quiet hover:bg-surface-alt hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </ToastPrimitive.Close>
            }
          />
          {/* Radix reads title/description from these for screen readers. */}
          <ToastPrimitive.Title className="sr-only">{item.title}</ToastPrimitive.Title>
          {item.description && (
            <ToastPrimitive.Description className="sr-only">
              {item.description}
            </ToastPrimitive.Description>
          )}
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed inset-x-0 top-0 z-50 flex flex-col gap-2 p-4 outline-none sm:top-auto sm:right-0 sm:bottom-0 sm:left-auto sm:w-full sm:max-w-dialog" />
    </ToastPrimitive.Provider>
  );
}

export { Toaster, ToastCard, toast, msSinceLastToast };
export type { ToastInput, ToastTone };
