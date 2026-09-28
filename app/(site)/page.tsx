import Link from "next/link";
import { site } from "@/lib/copy";

// Stage 1 placeholder. Replaced by the hero in Stage 5.
export default function HomePage() {
  const copy = site.foundation;

  return (
    <main className="mx-auto flex w-full max-w-flow flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl">{copy.heading}</h1>
      <p className="max-w-prose text-ink-quiet">{copy.body}</p>
      <Link
        href="/styles"
        className="inline-flex min-h-touch items-center self-start font-medium text-brand underline underline-offset-4 hover:text-brand-dark"
      >
        {copy.stylesLink}
      </Link>
    </main>
  );
}
