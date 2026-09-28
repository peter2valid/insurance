import type { Application, Client } from "@/lib/data/types";

/**
 * The motor flow's screens, in order (CLAUDE.md §8.1).
 * Pure functions, shared by server and browser.
 *
 * Where to resume is worked out from what has been answered, not from a
 * counter. So a returning client, a WhatsApp nudge link, or a "Change"
 * link from the review screen all land on the right place.
 */

export const screens = [
  "phone",
  "code",
  "vehicle",
  "logbook",
  "confirm",
  "cover",
  "value",
  "name",
  "id",
  "review",
] as const;
export type Screen = (typeof screens)[number];

export const TOTAL_STEPS = 5;

/** "Step N of 5" shown for each screen. Sub-screens share a step. */
export const stepOf: Record<Screen, number> = {
  phone: 1,
  code: 1,
  vehicle: 2,
  logbook: 3,
  confirm: 3,
  cover: 4,
  value: 4,
  name: 4,
  id: 4,
  review: 5,
};

export function isScreen(value: string): value is Screen {
  return (screens as readonly string[]).includes(value);
}

export function needsValue(coverType: string | undefined): boolean {
  return coverType !== "third_party";
}

function docStatus(app: Application, type: string) {
  return app.documents.find((doc) => doc.type === type)?.status ?? "needed";
}

/** The first screen that still needs an answer. */
export function nextScreen(app: Application, client: Client | null): Screen {
  const d = app.details;
  const logbookIn = docStatus(app, "logbook") !== "needed";

  if (d.vehicleConfirmed !== "yes") {
    if (logbookIn || d.logbookLater === "yes") return "confirm";
    if (!d.plate) return "vehicle";
    return "logbook";
  }
  if (!d.coverType) return "cover";
  if (needsValue(d.coverType) && !d.vehicleValueKes) return "value";
  if (!client?.name) return "name";
  if (docStatus(app, "national_id") === "needed" && d.idLater !== "yes") return "id";
  return "review";
}

/** Last completed step, for stall detection ("stopped at step 3"). */
export function completedStep(next: Screen): number {
  return stepOf[next] - 1;
}

/**
 * Screens a client may open: anything up to where they should resume,
 * plus the logbook screen while they're still on the plate question
 * (that's the "snap the logbook instead" path).
 */
export function canOpen(screen: Screen, resume: Screen, app: Application): boolean {
  if (screen === "phone" || screen === "code") return false; // signed in already
  if (screen === "logbook" && resume === "vehicle") return true;
  if (screen === "value" && !needsValue(app.details.coverType)) return false;
  return screens.indexOf(screen) <= screens.indexOf(resume);
}

/** Where "Back" goes from each screen. */
export function previousScreen(screen: Screen, app: Application | null): Screen | "home" {
  switch (screen) {
    case "phone":
      return "home";
    case "code":
      return "phone";
    case "vehicle":
      return "home";
    case "logbook":
      return "vehicle";
    case "confirm":
      return app?.details.logbookLater === "yes" || app?.documents.some((d) => d.type === "logbook" && d.status !== "needed")
        ? "logbook"
        : "vehicle";
    case "cover":
      return "confirm";
    case "value":
      return "cover";
    case "name":
      return needsValue(app?.details.coverType) ? "value" : "cover";
    case "id":
      return "name";
    case "review":
      return "id";
  }
}

export function screenHref(screen: Screen | "home", ref?: string): string {
  if (screen === "home") return "/";
  return ref ? `/start/${screen}?ref=${encodeURIComponent(ref)}` : `/start/${screen}`;
}
