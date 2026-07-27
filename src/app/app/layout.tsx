import Link from "next/link";
import { Providers } from "@/components/app/Providers";

export const metadata = {
  title: "Collection · Cardfolio",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="marketing-surface">
        <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper/95 shadow-[0_8px_24px_rgba(34,40,58,0.08)] backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3 md:gap-8">
              <Link
                href="/app"
                className="group flex min-w-0 items-center gap-2.5 no-underline sm:gap-3"
              >
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 shrink-0 -rotate-6 items-center justify-center border-2 border-ink bg-cream font-display text-sm tracking-wide text-ink shadow-[3px_3px_0_rgba(34,40,58,0.18)] transition-transform group-hover:rotate-[-3deg] sm:h-10 sm:w-10"
                >
                  CF
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-lg tracking-wide text-ink sm:text-xl">
                    Cardfolio
                  </span>
                  <span className="hidden font-mono text-[0.6rem] uppercase tracking-[0.16em] text-sage sm:inline">
                    Catalog desk
                  </span>
                </span>
              </Link>

              <nav className="hidden items-stretch border-2 border-ink md:flex">
                <Link
                  href="/app"
                  className="border-r-2 border-ink bg-cream px-4 py-2 font-body text-sm text-ink no-underline hover:bg-manila/40"
                >
                  Collection
                </Link>
                <Link
                  href="/app/cards/new"
                  className="border-r-2 border-ink bg-paper px-4 py-2 font-body text-sm text-charcoal no-underline hover:bg-cream"
                >
                  Intake
                </Link>
                <Link
                  href="/"
                  className="bg-paper px-4 py-2 font-body text-sm text-charcoal no-underline hover:bg-cream"
                >
                  Site
                </Link>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden border border-ink/30 bg-cream px-2 py-1 font-mono text-[0.65rem] tracking-[0.12em] text-sage uppercase lg:inline">
                Ref · CF-DESK
              </span>
              <Link
                href="/app/cards/new"
                className="cf-btn cf-btn-primary hidden shadow-[3px_3px_0_rgba(34,40,58,0.15)] sm:inline-flex"
              >
                Add card
              </Link>
            </div>
          </div>
        </header>

        <main className="app-main mx-auto w-full max-w-5xl px-4 py-6 sm:px-5 sm:py-10 md:px-8 md:py-12">
          {children}
        </main>

        <nav className="app-bottom-nav" aria-label="Mobile">
          <Link href="/app">Collection</Link>
          <Link href="/app/cards/new">Add card</Link>
          <Link href="/">Site</Link>
        </nav>
      </div>
    </Providers>
  );
}
