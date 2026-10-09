import { renderShareImage, shareImageAlt, shareImageSize } from "@/lib/share/og-image";

/** The picture shown when the site's link is shared. Drawn in lib/share (it needs raw colours). */
export const alt = shareImageAlt;
export const size = shareImageSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderShareImage();
}
