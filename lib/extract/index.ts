import { simulatedExtractLogbook } from "./simulated";
import type { LogbookExtraction } from "./types";

export * from "./types";

/**
 * Logbook reading (CLAUDE.md §2, §8.1 step 4).
 *
 * SIMULATED today: returns fixture data after a short delay. Later: real
 * OCR/vision (CLAUDE.md §12) implements the same function signature.
 *
 * Real reading will never be perfect, so the UI ALWAYS shows a confirm
 * screen with every field editable, and highlights low-confidence fields.
 */

export function extractLogbook(file: File): Promise<LogbookExtraction> {
  return simulatedExtractLogbook(file);
}
