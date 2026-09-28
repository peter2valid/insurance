import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { admin } from "@/lib/copy";

export const metadata: Metadata = { title: admin.title, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
