import type { Metadata } from "next";
import { agent } from "@/lib/copy";

export const metadata: Metadata = { title: { default: agent.title, template: `%s · ${agent.title}` }, robots: { index: false } };
export const dynamic = "force-dynamic";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
