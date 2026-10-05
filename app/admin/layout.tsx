import type { Metadata } from "next";
import { admin } from "@/lib/copy";

export const metadata: Metadata = { title: { default: admin.title, template: `%s · ${admin.title}` }, robots: { index: false } };
// Live data on every request — never pre-rendered.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
