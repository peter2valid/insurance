/** What every flow action returns: move on (with an optional toast), or show errors. */
export type ActionResult =
  | { ok: true; next: string; toast?: string }
  | { ok: false; errors: Record<string, string> };

export const initialResult: ActionResult = { ok: false, errors: {} };
