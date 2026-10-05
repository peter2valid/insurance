import { redirect } from "next/navigation";
import { after } from "next/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { maybeRunAutomations } from "@/lib/automation";
import { isAdmin } from "@/lib/session";

/** Every admin page: signed in (when ADMIN_PASSWORD is set), inside the shell. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  // Automations also run from admin visits (at most every 10 minutes), after
  // the page is sent — so the demo works with no scheduler set up.
  after(() => maybeRunAutomations());
  return <AdminShell>{children}</AdminShell>;
}
