import Link from "next/link";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-10 pt-4 sm:px-5 md:px-8">
      <div className="border-2 border-ink bg-paper shadow-[6px_6px_0_rgba(34,40,58,0.06)]">
        <div className="flex flex-col gap-8 px-5 py-7 sm:px-6 sm:py-8 md:flex-row md:items-start md:justify-between md:px-8 md:py-10">
          <div className="max-w-sm">
            <Link href="/" className="mb-4 inline-flex items-center gap-3 no-underline">
              <span
                aria-hidden
                className="inline-flex h-8 w-8 -rotate-6 items-center justify-center border-2 border-ink bg-cream font-display text-xs tracking-wide text-ink shadow-[2px_2px_0_rgba(34,40,58,0.15)]"
              >
                CF
              </span>
              <span className="font-display text-xl tracking-wide text-ink">
                Cardfolio
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-charcoal">
              A personal catalog for trading cards — identified, graded in
              estimate, and priced from the comps.
            </p>
            <p className="mt-3 font-mono text-xs tracking-[0.12em] text-sage uppercase">
              Catalog. Grade. Price.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-col gap-3 md:items-end md:pt-1"
          >
            <span className="mb-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-manila">
              Index
            </span>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm text-charcoal no-underline transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-dashed border-ink/25 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-mono text-[0.65rem] tracking-wide text-charcoal/60">
            © {new Date().getFullYear()} Cardfolio
          </p>
        </div>
      </div>
    </footer>
  );
}
