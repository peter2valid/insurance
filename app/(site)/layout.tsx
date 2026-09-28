import { SitePage } from "@/components/site/site-page";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SitePage>{children}</SitePage>;
}
