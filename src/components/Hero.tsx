import Link from "next/link";
import { CatalogCard } from "./CatalogCard";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-5xl items-center gap-10 px-4 pb-12 pt-12 sm:gap-12 sm:px-5 sm:pb-16 sm:pt-10 md:grid-cols-2 md:gap-10 md:px-8 md:pb-24 md:pt-10">
      <div className="max-w-xl">
        <p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-sage sm:mb-4 sm:text-xs">
          Personal trading card catalog
        </p>
        <h1 className="mb-4 font-display text-[1.85rem] leading-[1.15] text-ink sm:mb-5 sm:text-4xl md:text-5xl">
          Every card you own, catalogued and priced.
        </h1>
        <p className="mb-6 max-w-md text-[0.95rem] leading-relaxed text-charcoal sm:mb-8 sm:text-base md:text-lg">
          Upload a photo, get the player, set, condition, and current market
          value back automatically.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center border-2 border-ink bg-ink px-4 py-2.5 text-center font-body text-sm font-medium text-paper no-underline transition-opacity hover:opacity-90 sm:px-5"
          >
            Get Started
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex min-h-11 items-center justify-center border-2 border-ink bg-transparent px-4 py-2.5 text-center font-body text-sm font-medium text-ink no-underline transition-colors hover:bg-paper sm:px-5"
          >
            How it works
          </a>
        </div>
      </div>

      <div className="flex justify-center px-2 md:justify-end md:px-0">
        <CatalogCard />
      </div>
    </section>
  );
}
