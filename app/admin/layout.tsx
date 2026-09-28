import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { admin } from "@/lib/copy";

export const metadata: Metadata = { title: admin.title, robots: { index: false } };
// Live data on every request — never pre-rendered.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
