const steps = [
  {
    number: "01",
    label: "Intake",
    title: "Upload a photo",
    body: "Snap or upload a picture of any trading card. Front is enough; the back helps when the set is ambiguous.",
  },
  {
    number: "02",
    label: "Verify",
    title: "Confirm the auto-ID",
    body: "Cardfolio matches player, set, and year, then estimates condition. You approve or correct before it files.",
  },
  {
    number: "03",
    label: "Catalog",
    title: "Browse your catalog",
    body: "Search, filter, and total the collection. Each entry keeps its grade estimate and current market price.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-5 sm:py-20 md:px-8 md:py-28"
    >
      <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-sage">
            Process · three steps
          </p>
          <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
            From photo to filed record.
          </h2>
        </div>
        <p className="max-w-xs font-body text-sm leading-relaxed text-charcoal/80 md:text-right">
          No spreadsheets. No guessing comps. One pass through the drawer and
          the card is indexed.
        </p>
      </div>

      <div className="relative border-2 border-ink bg-paper shadow-[8px_8px_0_rgba(34,40,58,0.08)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#d8b87c_0_12px,#faf5e9_12px_24px)] opacity-80"
        />

        <div className="grid md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className={`relative flex flex-col px-6 pb-8 pt-10 md:px-8 md:pb-10 md:pt-12 ${
                index < steps.length - 1
                  ? "border-b-2 border-ink md:border-b-0 md:border-r-2"
                  : ""
              }`}
            >
              <div className="mb-8 flex items-start justify-between gap-3">
                <span className="font-mono text-[2.75rem] leading-none tracking-tight text-ink/15 md:text-[3.25rem]">
                  {step.number}
                </span>
                <span className="mt-1 border border-ink/25 bg-cream px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-sage">
                  {step.label}
                </span>
              </div>

              <h3 className="mb-3 font-display text-xl text-ink md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-auto text-sm leading-relaxed text-charcoal md:text-[0.95rem] md:leading-relaxed">
                {step.body}
              </p>

              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -bottom-3 left-1/2 z-10 hidden -translate-x-1/2 font-mono text-xs text-manila md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:block md:translate-x-1/2 md:-translate-y-1/2"
                >
                  →
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
