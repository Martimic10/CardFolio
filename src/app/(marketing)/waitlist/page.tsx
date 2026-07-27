import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function WaitlistPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto w-full max-w-xl px-5 py-16 md:px-8 md:py-24">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-sage">
          Early access
        </p>
        <h1 className="mb-4 font-display text-3xl text-ink md:text-4xl">
          Join the waitlist
        </h1>
        <p className="mb-8 text-base leading-relaxed text-charcoal">
          Email capture isn&apos;t wired up yet. Check back soon, or return to
          the home page.
        </p>
        <Link
          href="/"
          className="inline-block border-2 border-ink bg-transparent px-5 py-2.5 font-body text-sm font-medium text-ink no-underline transition-colors hover:bg-ink hover:text-paper"
        >
          Back to home
        </Link>
      </section>
      <Footer />
    </main>
  );
}
