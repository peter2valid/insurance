import type { Application, Client, DocumentType, Product } from "@/lib/data/types";
import { coversFor } from "@/lib/data/motor";
import { isAnswered, isQuestionScreen, questionScreens, type QuestionScreenId } from "./questions";

/**
 * Every product's flow, in order (CLAUDE.md §8.1). Pure functions, shared
 * by server and browser.
 *
 * Where to resume is worked out from what has been answered, not from a
 * counter. So a returning client, a WhatsApp nudge link, or a "Change"
 * link from the review screen all land on the right place.
 */

type MotorScreen = "vehicle" | "logbook" | "confirm" | "cover" | "value";
type SharedScreen = "phone" | "code" | "name" | "id" | "review";
type UploadScreen = "passport" | "registration" | "kra";
export type Screen = SharedScreen | MotorScreen | UploadScreen | QuestionScreenId;

export const TOTAL_STEPS = 5;

/** The content screens (after sign-in) for each product, in order. */
export const flows: Record<Product, readonly Screen[]> = {
  // Logbook first: one photo gives us the document AND fills the vehicle details.
  motor: ["category", "logbook", "confirm", "cover", "value", "name", "id", "kra", "review"],
  health: ["who", "ages", "plan", "limit", "conditions", "name", "id", "review"],
  travel: ["destination", "dates", "travellers", "purpose", "name", "passport", "review"],
  business: ["business", "covers", "size", "name", "registration", "review"],
};

/** "Step N of 5" for each screen. Screen ids are unique across products. */
export const stepOf: Record<Screen, number> = {
  phone: 1,
  code: 1,
  // motor
  category: 2,
  vehicle: 2,
  logbook: 3,
  confirm: 3,
  cover: 3,
  value: 3,
  kra: 4,
  // health
  who: 2,
  ages: 2,
  plan: 3,
  limit: 3,
  conditions: 4,
  // travel
  destination: 2,
  dates: 2,
  travellers: 3,
  purpose: 3,
  passport: 4,
  // business
  business: 2,
  covers: 3,
  size: 3,
  registration: 4,
  // shared
  name: 4,
  id: 4,
  review: 5,
};

const allScreens = Object.keys(stepOf) as Screen[];

export function isScreen(value: string): value is Screen {
  return (allScreens as string[]).includes(value);
}

/** Upload screens: which document each asks for, and the "later" flag it sets. */
export const uploadScreens: Record<"id" | UploadScreen, { document: DocumentType; laterKey: string }> = {
  id: { document: "national_id", laterKey: "idLater" },
  passport: { document: "passport", laterKey: "passportLater" },
  registration: { document: "business_registration", laterKey: "registrationLater" },
  kra: { document: "kra_pin", laterKey: "kraLater" },
};

/** The "upload later" flag for a document uploaded in the flow. */
export function laterKeyFor(document: DocumentType): string | undefined {
  return Object.values(uploadScreens).find((screen) => screen.document === document)?.laterKey;
}

export function needsValue(coverType: string | undefined): boolean {
  return coverType !== "third_party";
}

function docIn(app: Application, type: DocumentType) {
  return (app.documents.find((doc) => doc.type === type)?.status ?? "needed") !== "needed";
}

/** Does this screen apply to this application at all? */
function applies(screen: Screen, app: Application): boolean {
  if (screen === "value") return needsValue(app.details.coverType);
  return true;
}

/** Has this screen been answered? */
function isDone(screen: Screen, app: Application, client: Client | null): boolean {
  const d = app.details;
  switch (screen) {
    case "vehicle":
      return Boolean(d.plate) || docIn(app, "logbook") || d.logbookLater === "yes" || d.vehicleConfirmed === "yes";
    case "logbook":
      return docIn(app, "logbook") || d.logbookLater === "yes" || d.vehicleConfirmed === "yes";
    case "confirm":
      return d.vehicleConfirmed === "yes";
    case "cover":
      return Boolean(d.coverType) && coversFor(d.category).includes(d.coverType as never);
    case "value":
      return Boolean(d.vehicleValueKes);
    case "name":
      return Boolean(client?.name);
    case "id":
    case "passport":
    case "kra":
    case "registration": {
      const { document, laterKey } = uploadScreens[screen];
      // "uploading": the file is uploading in the background — carry on.
      return docIn(app, document) || d[laterKey] === "yes" || d[laterKey] === "uploading";
    }
    case "review":
    case "phone":
    case "code":
      return false;
    default:
      return isQuestionScreen(screen) ? isAnswered(questionScreens[screen], d) : false;
  }
}

/** The first screen that still needs an answer. */
export function nextScreen(app: Application, client: Client | null): Screen {
  const flow = flows[app.product];
  return flow.find((screen) => applies(screen, app) && !isDone(screen, app, client)) ?? "review";
}

/** Last completed step, for stall detection ("stopped at step 3"). */
export function completedStep(next: Screen): number {
  return stepOf[next] - 1;
}

/**
 * Screens a client may open: anything in their product's flow up to where
 * they should resume — plus, for motor, the logbook screen while still on
 * the plate question ("snap the logbook instead").
 */
export function canOpen(screen: Screen, resume: Screen, app: Application): boolean {
  const flow = flows[app.product];
  if (!flow.includes(screen) || !applies(screen, app)) return false;
  if (screen === "logbook" && resume === "vehicle") return true;
  return flow.indexOf(screen) <= flow.indexOf(resume);
}

/** Where "Back" goes: the previous screen that applies, or home. */
export function previousScreen(screen: Screen, app: Application | null): Screen | "home" {
  if (screen === "phone") return "home";
  if (screen === "code") return "phone";
  if (!app) return "home";
  const flow = flows[app.product];
  const index = flow.indexOf(screen);
  for (let i = index - 1; i >= 0; i--) {
    if (applies(flow[i], app)) return flow[i];
  }
  return "home";
}

export function screenHref(screen: Screen | "home", ref?: string): string {
  if (screen === "home") return "/";
  return ref ? `/start/${screen}?ref=${encodeURIComponent(ref)}` : `/start/${screen}`;
}
