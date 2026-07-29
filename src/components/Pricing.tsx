import Link from "next/link";
import { FREE_CARD_LIMIT, PRO_PLANS } from "@/lib/plans";

const plans = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    priceNote: "Forever",
    description: "Catalog your collection by hand — no credit card required.",
    features: [
      `Up to ${FREE_CARD_LIMIT} cards`,
      "Photos & condition sliders",
      "Manual price updates",
      "Search, filter, and sort",
    ],
    cta: "Get started",
    href: "/sign-up",
    featured: false,
  },
  {
    id: PRO_PLANS[0].id,
    name: "Pro Monthly",
    priceLabel: "$8",
    priceNote: "per month",
    description: PRO_PLANS[0].description,
    features: [
      "Unlimited cards",
      "Automatic price estimates",
      "Full price history",
      "Market trends & movers",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    featured: true,
  },
  {
    id: PRO_PLANS[1].id,
    name: "Pro Lifetime",
    priceLabel: "$160",
    priceNote: "one-time",
    description: PRO_PLANS[1].description,
    features: [
      "Everything in Pro Monthly",
      "Pay once — no renewals",
      "Same Pro tools forever",
      "Best if you’re in for the long haul",
    ],
    cta: "Get lifetime",
    href: "/sign-up",
    featured: false,
  },
] as const;

export function Pricing() {
  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-20"
    >
      <div className="mb-10 max-w-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-sage">
          Plans
        </p>
        <h2 className="font-display text-3xl text-ink md:text-4xl">Pricing</h2>
        <p className="mt-3 font-body text-sm leading-relaxed text-charcoal md:text-base">
          Start free. Upgrade when you want unlimited cards and market tools.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`flex flex-col border-2 border-ink bg-paper p-5 sm:p-6 ${
              plan.featured ? "relative md:-translate-y-1 md:shadow-[6px_6px_0_rgba(34,40,58,0.12)]" : ""
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-4 border-2 border-ink bg-ink px-2 py-0.5 font-mono text-[0.6rem] tracking-wide text-paper uppercase">
                Most popular
              </span>
            )}
            <p className="cf-label">{plan.name}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-medium tabular-nums text-ink sm:text-4xl">
                {plan.priceLabel}
              </span>
              <span className="font-mono text-xs tracking-wide text-sage uppercase">
                {plan.priceNote}
              </span>
            </div>
            <p className="mt-3 font-body text-sm leading-relaxed text-charcoal">
              {plan.description}
            </p>
            <ul className="mt-5 flex-1 space-y-2 border-t border-dotted border-manila pt-5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="font-body text-sm text-charcoal"
                >
                  <span className="text-sage">· </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`cf-btn mt-6 w-full ${
                plan.featured ? "cf-btn-primary" : ""
              }`}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
