/**
 * Sensitive values in list views (CLAUDE.md §9).
 * "29384756" -> "•••• 4756"
 */
export function maskId(value: string | undefined): string {
  if (!value) return "";
  const digits = value.replace(/\s/g, "");
  return `•••• ${digits.slice(-4)}`;
}

/** "+254700000100" -> "+254 7•• ••• 100" */
export function maskPhone(e164: string): string {
  const national = e164.replace(/^\+254/, "");
  return `+254 ${national.slice(0, 1)}•• ••• ${national.slice(-3)}`;
}
