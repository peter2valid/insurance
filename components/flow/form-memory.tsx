"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Remembers what was typed or tapped in the surrounding form, on this phone,
 * so a reload, a dropped connection or coming back later doesn't lose it.
 *
 * - Restores only into fields that are still empty (saved answers from the
 *   server always win), in two passes so questions revealed by the first
 *   answers (e.g. seats after "Matatu") are filled too.
 * - Never stores files, passwords or hidden fields. Forgets after 3 days.
 * - Browser storage is a convenience: if it's blocked, nothing breaks.
 */
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
type Saved = { at: number; values: Record<string, string[]> };

function fieldsOf(form: HTMLFormElement) {
  return Array.from(form.elements).filter(
    (el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) &&
      Boolean(el.name) &&
      !["hidden", "file", "password", "submit", "button"].includes(el.type),
  );
}

function read(key: string): Saved | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    if (Date.now() - saved.at > MAX_AGE_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

function setValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const proto = Object.getPrototypeOf(el) as object;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function restore(form: HTMLFormElement, values: Record<string, string[]>) {
  for (const el of fieldsOf(form)) {
    const wanted = values[el.name];
    if (!wanted?.length) continue;
    if (el instanceof HTMLInputElement && (el.type === "radio" || el.type === "checkbox")) {
      const group = form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(el.name)}"]`);
      // Leave a group the person (or the server) has already answered, beyond a default.
      const answered = Array.from(group).some((box) => box.checked && !box.defaultChecked);
      if (!answered && wanted.includes(el.value) && !el.checked) el.click();
    } else if (!el.value) {
      setValue(el, wanted[0]);
    }
  }
}

export function FormMemory() {
  const anchor = React.useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  React.useEffect(() => {
    // One memory per screen and application (the ?ref in the address).
    const ref = new URLSearchParams(window.location.search).get("ref");
    const key = `form-memory:${pathname}${ref ? `:${ref}` : ""}`;
    const form = anchor.current?.closest("form");
    if (!form) return;

    const saved = read(key);
    if (saved) {
      restore(form, saved.values);
      // Second pass for questions the first answers revealed.
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => restore(form, saved.values)));
      return attach(form, key, frame);
    }
    return attach(form, key);
  }, [pathname]);

  return <span ref={anchor} hidden />;
}

function attach(form: HTMLFormElement, key: string, frame?: number) {
  const save = () => {
    const values: Record<string, string[]> = {};
    for (const el of fieldsOf(form)) {
      if (el instanceof HTMLInputElement && (el.type === "radio" || el.type === "checkbox")) {
        if (el.checked) (values[el.name] ??= []).push(el.value);
      } else if (el.value) {
        values[el.name] = [el.value];
      }
    }
    try {
      localStorage.setItem(key, JSON.stringify({ at: Date.now(), values } satisfies Saved));
    } catch {
      // Storage full or blocked: carry on without remembering.
    }
  };
  form.addEventListener("input", save);
  form.addEventListener("change", save);
  return () => {
    if (frame) cancelAnimationFrame(frame);
    form.removeEventListener("input", save);
    form.removeEventListener("change", save);
  };
}
