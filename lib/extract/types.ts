export type LogbookField =
  | "plate"
  | "make"
  | "model"
  | "year"
  | "chassisNumber"
  | "bodyType"
  | "ownerName";

export type Confidence = "high" | "low";

export interface LogbookExtraction {
  fields: Record<LogbookField, string>;
  confidence: Record<LogbookField, Confidence>;
}

export type ExtractionErrorCode = "unreadable" | "unsupported_file" | "too_large";

/** Screens map `code` to a plain-language message in lib/copy. */
export class ExtractionError extends Error {
  constructor(public readonly code: ExtractionErrorCode) {
    super(`Logbook extraction failed: ${code}`);
    this.name = "ExtractionError";
  }
}

export const MAX_LOGBOOK_BYTES = 10 * 1024 * 1024;
