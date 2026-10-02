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

// 4 MB: under Vercel's 4.5 MB request limit. Photos are compressed far below this.
export const MAX_LOGBOOK_BYTES = 4 * 1024 * 1024;
