import Link from "next/link";

export function FooterCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-20">
      <div className="border-2 border-ink bg-paper px-5 py-10 text-center sm:px-6 sm:py-12 md:px-12">
        <h2 className="mb-4 font-display text-xl text-ink sm:text-2xl md:text-3xl">
          Ready to file your collection?
        </h2>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-charcoal sm:mb-8 md:text-base">
          Create a free account and start cataloguing your cards in minutes.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex min-h-11 items-center justify-center border-2 border-ink bg-ink px-5 py-2.5 font-body text-sm font-medium text-paper no-underline transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
