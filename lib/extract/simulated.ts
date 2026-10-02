import {
  ExtractionError,
  MAX_LOGBOOK_BYTES,
  type LogbookExtraction,
  type LogbookField,
} from "./types";

/**
 * SIMULATED logbook reader. Does not look at the image at all: it picks a
 * fixture based on the file size, so the same photo gives the same result.
 * One field is always marked low-confidence so the confirm screen's
 * "please check this" state is exercised in every demo.
 *
 * Demo triggers: a file under 20 KB is "unreadable"; non-image/PDF is
 * "unsupported".
 */

const FIXTURES: Record<LogbookField, string>[] = [
  { plate: "KDG 482T", make: "Toyota", model: "Premio", year: "2017", chassisNumber: "NZT260-3120457", bodyType: "Saloon", ownerName: "Samuel Kariuki" },
  { plate: "KDH 105Y", make: "Mazda", model: "CX-5", year: "2016", chassisNumber: "KE2FW-203918", bodyType: "SUV", ownerName: "Esther Wanjiru" },
  { plate: "KDF 390R", make: "Nissan", model: "Note", year: "2015", chassisNumber: "E12-418273", bodyType: "Hatchback", ownerName: "Collins Otieno" },
];

const LOW_CONFIDENCE: LogbookField[] = ["chassisNumber", "year", "chassisNumber"];

const DELAY_MS = 900;
const MIN_READABLE_BYTES = 20 * 1024;

export async function simulatedExtractLogbook(file: File): Promise<LogbookExtraction> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new ExtractionError("unsupported_file");
  }
  if (file.size > MAX_LOGBOOK_BYTES) throw new ExtractionError("too_large");
  if (file.size < MIN_READABLE_BYTES) throw new ExtractionError("unreadable");

  const index = file.size % FIXTURES.length;
  const fields = { ...FIXTURES[index] };
  const confidence = Object.fromEntries(
    Object.keys(fields).map((key) => [key, key === LOW_CONFIDENCE[index] ? "low" : "high"]),
  ) as LogbookExtraction["confidence"];

  return { fields, confidence };
}
