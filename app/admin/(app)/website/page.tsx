import { HeroImageForm } from "@/components/admin/hero-image-form";
import { PageHeader } from "@/components/admin/page-header";
import { SiteContentForm } from "@/components/admin/site-content-form";
import { admin } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";

export const metadata = { title: admin.nav.website };

/** Website settings the broker can change without a developer. */
export default async function WebsitePage() {
  const { heroImageId, site } = await getRepo().getSettings();
  return (
    <>
      <PageHeader title={admin.website.heading} description={admin.website.intro} />
      <HeroImageForm imageId={heroImageId} />
      <SiteContentForm content={site} />
    </>
  );
}
