import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-6 md:px-8">
      <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline sm:gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 -rotate-6 items-center justify-center border-2 border-ink bg-paper font-display text-sm tracking-wide text-ink shadow-[2px_2px_0_rgba(34,40,58,0.2)]"
        >
          CF
        </span>
        <span className="truncate font-display text-lg tracking-wide text-ink sm:text-xl">
          Cardfolio
        </span>
      </Link>

      <nav className="flex shrink-0 items-center gap-3 sm:gap-6">
        <a
          href="#how-it-works"
          className="hidden font-body text-sm text-charcoal no-underline hover:text-ink md:inline"
        >
          How it works
        </a>
        <a
          href="#features"
          className="hidden font-body text-sm text-charcoal no-underline hover:text-ink md:inline"
        >
          Features
        </a>
        <a
          href="#pricing"
          className="hidden font-body text-sm text-charcoal no-underline hover:text-ink md:inline"
        >
          Pricing
        </a>
        <a
          href="#faq"
          className="hidden font-body text-sm text-charcoal no-underline hover:text-ink md:inline"
        >
          FAQ
        </a>
        <HeaderAuth />
      </nav>
    </header>
  );
}
