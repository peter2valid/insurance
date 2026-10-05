import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { admin } from "@/lib/copy";
import { adminPasswordSet, isAdmin } from "@/lib/session";

export const metadata = { title: admin.login.title };

/** Admin sign-in. Only used when ADMIN_PASSWORD is set; otherwise admin is open (demo). */
export default async function AdminLoginPage() {
  if (!adminPasswordSet() || (await isAdmin())) redirect("/admin");
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12">
      <AdminLoginForm />
    </main>
  );
}
