import type { Metadata } from "next";
import { TextLink } from "@/components/ui/text-link";
import { styles as copy } from "@/lib/copy";
import { ComponentGallery } from "./component-gallery";
import { ThemeSwitch } from "./theme-switch";
import { TokenGallery } from "./token-gallery";

export const metadata: Metadata = { title: copy.meta.title };

/*
 * Kitchen-sink page (CLAUDE.md §5): every token and every kit component in
 * every state. Anything new goes here before it is used on a screen.
 */
export default function StylesPage() {
  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-12 px-4 py-12">
      <header className="flex flex-col gap-4">
        <TextLink href="/" standalone>
          {copy.back}
        </TextLink>
        <h1 className="text-3xl">{copy.heading}</h1>
        <p className="max-w-prose text-ink-quiet">{copy.intro}</p>
        <ThemeSwitch />
      </header>

      <div className="flex flex-col gap-8">
        <h2 className="text-2xl">{copy.groups.tokens}</h2>
        <TokenGallery />
      </div>

      <div className="flex flex-col gap-8">
        <h2 className="text-2xl">{copy.groups.components}</h2>
        <ComponentGallery />
      </div>
    </main>
  );
}
