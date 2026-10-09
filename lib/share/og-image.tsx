import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import { common } from "@/lib/copy";

/*
 * The picture shown when the site's link is shared (WhatsApp, Facebook, X).
 * Image generation can't read CSS variables, so the brand tokens
 * (lib/tokens/tokens.css) are repeated here as values.
 */
export const shareImageAlt = common.meta.shareHeadline;
export const shareImageSize = { width: 1200, height: 630 };


/** Draws the share picture (used by app/opengraph-image.tsx). */
export function renderShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#175C54",
          color: "#FFFFFF",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, display: "flex" }}>{brand.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, maxWidth: 960 }}>{common.meta.shareHeadline}</div>
          <div style={{ fontSize: 32, color: "#D8E6E2", fontFamily: "Arial, sans-serif" }}>{common.meta.shareLine}</div>
        </div>
      </div>
    ),
    shareImageSize,
  );
}
