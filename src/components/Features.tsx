const features = [
  {
    accent: "border-t-manila",
    title: "Condition estimate",
    body: "A grade estimate based on centering, corners, edges, and surface — recorded next to every card.",
  },
  {
    accent: "border-t-sage",
    title: "Live comps pricing",
    body: "Market value drawn from recent comparable sales, updated as the comps move.",
  },
  {
    accent: "border-t-stamp",
    title: "Collection total",
    body: "A running sum of what you own, searchable by player, set, year, or estimated grade.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-20"
    >
      <div className="mb-10 max-w-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-sage">
          What you get
        </p>
        <h2 className="font-display text-3xl text-ink md:text-4xl">Features</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className={`border border-ink/20 border-t-4 bg-paper p-6 ${feature.accent}`}
          >
            <h3 className="mb-3 font-display text-xl text-ink">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-charcoal">
              {feature.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
