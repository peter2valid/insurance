import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { About, Faq, HowItWorks, Insurers } from "@/components/site/home-sections";
import { site } from "@/lib/copy";

export const metadata: Metadata = {
  title: { absolute: site.meta.title },
  description: site.meta.description,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <About />
      <Insurers />
      <Faq />
    </>
  );
}
