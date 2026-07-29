const faqs = [
  {
    question: "What cards does Cardfolio recognize?",
    answer:
      "Modern and vintage baseball, basketball, football, and hockey cards to start. Recognition improves as more sets are indexed. Obscure parallels and custom cards may need a manual correction.",
  },
  {
    question: "How accurate is the condition estimate?",
    answer:
      "It is an estimate, not a PSA or BGS grade. The model looks at centering, corners, edges, and surface from your photo and returns a suggested range. Use it for cataloging; send cards out if you need a slab.",
  },
  {
    question: "Where do market prices come from?",
    answer:
      "Recent comparable sales for the same card and similar condition. Prices update as comps move. Thin markets show wider ranges; liquid cards show tighter ones.",
  },
  {
    question: "Do I need photos of both sides?",
    answer:
      "Front alone is usually enough. The back helps when the set year or parallel is ambiguous. You can add a second photo later without redoing the entry.",
  },
  {
    question: "Is Cardfolio free?",
    answer:
      "Yes — Free includes up to 50 cards with manual cataloging and price entry. Pro Monthly ($8/mo) or Pro Lifetime ($160 once) unlocks unlimited cards, auto pricing, price history, and market trends.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-5 sm:py-16 md:px-8 md:py-20"
    >
      <div className="mb-10 max-w-xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-sage">
          Questions
        </p>
        <h2 className="font-display text-3xl text-ink md:text-4xl">FAQ</h2>
      </div>

      <div className="border-2 border-ink bg-paper">
        {faqs.map((faq, index) => (
          <details
            key={faq.question}
            className={`group px-5 py-1 md:px-7 ${
              index < faqs.length - 1 ? "border-b border-ink/20" : ""
            }`}
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 py-4 font-display text-[0.95rem] leading-snug text-ink marker:content-none [&::-webkit-details-marker]:hidden sm:items-center sm:gap-4 sm:py-5 sm:text-base md:text-lg">
              <span className="text-left">{faq.question}</span>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 font-mono text-sm text-stamp transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-5 pr-2 text-sm leading-relaxed text-charcoal sm:pr-8 md:text-[0.95rem]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
