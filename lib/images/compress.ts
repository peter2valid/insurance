/**
 * Shrink photos in the browser before upload (CLAUDE.md §8.1 step 4).
 * Phone photos are often 3–8 MB; on mobile data that's slow and costly.
 * Resizes to at most 1600px on the long edge and re-encodes as JPEG.
 *
 * PDFs and anything the browser can't decode are returned unchanged.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file; // never make it bigger

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file; // e.g. HEIC on a browser that can't decode it
  }
}
