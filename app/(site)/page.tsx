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
  const agent = typeof code === "string" ? await getRepo().findAgentByCode(code) : null;
  return (
    <>
      <Hero referredBy={agent?.status === "active" ? agent.name : undefined} />
      <HowItWorks />
      <About />
      <Insurers panel={(await getRepo().getSettings()).panel} />
      <Faq />
      <BecomeAgent />
    </>
  );
}
