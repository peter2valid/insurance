import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { About, BecomeAgent, Faq, HowItWorks, Insurers } from "@/components/site/home-sections";
import { site } from "@/lib/copy";
import { getRepo } from "@/lib/data/repo";

export const metadata: Metadata = {
  title: { absolute: site.meta.title },
  description: site.meta.description,
};

export default async function HomePage(props: PageProps<"/">) {
  // Arrived through an agent's link (/r/CODE): say who referred them.
  const code = (await props.searchParams).agent;
  const repo = getRepo();
  const [agent, settings] = await Promise.all([
    typeof code === "string" ? repo.findAgentByCode(code) : null,
    repo.getSettings(),
  ]);
  return (
    <>
      <Hero referredBy={agent?.status === "active" ? agent.name : undefined} imageId={settings.heroImageId || undefined} />
      <HowItWorks />
      <About content={settings.site} />
      <Insurers panel={settings.panel} />
      <Faq />
      <BecomeAgent />
    </>
  );
}
