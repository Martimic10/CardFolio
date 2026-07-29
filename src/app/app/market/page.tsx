"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError, fetchMarketInsights, fetchMe, fetchSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/pricing";
import { UpgradePopup } from "@/components/app/UpgradePopup";

export default function MarketTrendsPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const summaryQuery = useQuery({ queryKey: ["summary"], queryFn: fetchSummary });
  const hasPro = meQuery.data?.hasProAccess ?? false;

  const marketQuery = useQuery({
    queryKey: ["market"],
    queryFn: fetchMarketInsights,
    enabled: hasPro,
    retry: false,
  });

  const insights = marketQuery.data?.insights;
  const movers =
    tab === "gainers" ? (insights?.gainers ?? []) : (insights?.losers ?? []);
  const indexPath = useMemo(
    () => sparkPath(insights?.indexSpark ?? [], 280, 72),
    [insights?.indexSpark],
  );

  const proBlocked =
    marketQuery.error instanceof ApiError &&
    marketQuery.error.code === "PRO_REQUIRED";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 min-[900px]:space-y-6">
      <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between">
        <div>
          <p className="cf-label mb-2">Market desk</p>
          <h1 className="font-display text-2xl text-ink min-[900px]:text-3xl">
            Market trends
          </h1>
          <p className="mt-2 max-w-lg font-body text-sm text-charcoal">
            Movers and set momentum from price updates in your catalog.
          </p>
        </div>
        {!hasPro && (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="cf-btn cf-btn-primary"
          >
            Unlock with Pro
          </button>
        )}
      </div>

      {!hasPro || proBlocked ? (
        <LockedMarketPreview onUpgrade={() => setUpgradeOpen(true)} />
      ) : marketQuery.isLoading ? (
        <div className="cf-panel px-6 py-16 text-center font-body text-sm text-charcoal">
          Loading market insights…
        </div>
      ) : marketQuery.isError ? (
        <div className="border-2 border-stamp bg-paper px-4 py-3 font-body text-sm text-stamp">
          Couldn&apos;t load market insights.{" "}
          <button type="button" className="underline" onClick={() => marketQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 min-[900px]:grid-cols-[1.4fr_1fr]">
            <section className="cf-panel p-4 min-[900px]:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="cf-label">Collection value</p>
                  <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-ink">
                    {formatCurrency(insights?.totalValue ?? 0)}
                  </p>
                  <p className="mt-1 font-mono text-sm tabular-nums">
                    {insights?.change30dPct != null ? (
                      <span
                        className={
                          insights.change30dPct >= 0 ? "text-sage" : "text-stamp"
                        }
                      >
                        {insights.change30dPct >= 0 ? "+" : ""}
                        {insights.change30dPct.toFixed(1)}% · 30 days
                        {insights.change30dAmount != null
                          ? ` (${insights.change30dAmount >= 0 ? "+" : ""}${formatCurrency(insights.change30dAmount)})`
                          : ""}
                      </span>
                    ) : (
                      <span className="text-sage">
                        Add more price updates to see 30-day change
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {(insights?.indexSpark?.length ?? 0) >= 2 ? (
                <svg
                  viewBox="0 0 280 72"
                  className="h-20 w-full text-ink"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d={indexPath.area} fill="currentColor" className="opacity-[0.08]" />
                  <path
                    d={indexPath.line}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <p className="border border-dashed border-manila px-3 py-8 text-center font-body text-sm text-charcoal">
                  Chart appears after you log multiple price updates over time.
                </p>
              )}
            </section>

            <section className="cf-panel p-4 min-[900px]:p-5">
              <p className="cf-label mb-3">Your catalog</p>
              <dl className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-dotted border-manila pb-2">
                  <dt className="font-body text-sm text-charcoal">Cards filed</dt>
                  <dd className="font-mono text-sm font-medium tabular-nums text-ink">
                    {summaryQuery.data?.uniqueCards ?? 0}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-b border-dotted border-manila pb-2">
                  <dt className="font-body text-sm text-charcoal">With price history</dt>
                  <dd className="font-mono text-sm font-medium tabular-nums text-ink">
                    {insights?.cardsWithHistory ?? 0}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-body text-sm text-charcoal">Top mover</dt>
                  <dd className="max-w-[55%] text-right">
                    {insights?.topMover ? (
                      <Link
                        href={`/app/cards/${insights.topMover.cardId}`}
                        className="font-body text-sm text-ink no-underline hover:underline"
                      >
                        {insights.topMover.player}{" "}
                        <span
                          className={`font-mono text-xs ${
                            insights.topMover.change >= 0 ? "text-sage" : "text-stamp"
                          }`}
                        >
                          {insights.topMover.change >= 0 ? "+" : ""}
                          {insights.topMover.change.toFixed(1)}%
                        </span>
                      </Link>
                    ) : (
                      <span className="font-mono text-sm text-sage">—</span>
                    )}
                  </dd>
                </div>
              </dl>
              <Link
                href="/app/collection"
                className="mt-4 inline-block font-body text-sm text-charcoal underline hover:text-ink"
              >
                Open dashboard →
              </Link>
            </section>
          </div>

          <section className="cf-panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b-2 border-ink bg-cream/50 p-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between min-[900px]:px-4">
              <h2 className="font-display text-lg text-ink">Top movers</h2>
              <div className="flex border-2 border-ink">
                <button
                  type="button"
                  onClick={() => setTab("gainers")}
                  className={`min-h-10 flex-1 px-3 font-mono text-[0.65rem] tracking-wide uppercase min-[900px]:flex-none ${
                    tab === "gainers" ? "bg-ink text-paper" : "bg-paper text-charcoal"
                  }`}
                >
                  Gainers
                </button>
                <button
                  type="button"
                  onClick={() => setTab("losers")}
                  className={`min-h-10 flex-1 border-l-2 border-ink px-3 font-mono text-[0.65rem] tracking-wide uppercase min-[900px]:flex-none ${
                    tab === "losers" ? "bg-ink text-paper" : "bg-paper text-charcoal"
                  }`}
                >
                  Losers
                </button>
              </div>
            </div>

            {movers.length === 0 ? (
              <EmptyMovers />
            ) : (
              <>
                <div className="hidden min-[900px]:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-ink/20 bg-cream">
                        {["Card", "Category", "Price", "Change", "Trend"].map((h) => (
                          <th key={h} className="px-4 py-2.5">
                            <span className="cf-label">{h}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {movers.map((m) => (
                        <tr key={m.cardId} className="border-b border-ink/10 last:border-b-0">
                          <td className="px-4 py-3">
                            <Link
                              href={`/app/cards/${m.cardId}`}
                              className="no-underline"
                            >
                              <p className="font-body text-sm font-medium text-ink">
                                {m.player}
                              </p>
                              <p className="font-body text-xs text-charcoal">{m.setName}</p>
                            </Link>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-charcoal">
                            {m.sport}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm tabular-nums text-stamp">
                            {formatCurrency(m.price)}
                          </td>
                          <td className="px-4 py-3">
                            <ChangeBadge value={m.change} />
                          </td>
                          <td className="px-4 py-3">
                            <MiniSpark values={m.spark} up={m.change >= 0} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-ink/10 min-[900px]:hidden">
                  {movers.map((m) => (
                    <li key={m.cardId}>
                      <Link
                        href={`/app/cards/${m.cardId}`}
                        className="flex gap-3 px-3 py-3 no-underline"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate font-body text-sm font-medium text-ink">
                              {m.player}
                            </span>
                            <ChangeBadge value={m.change} />
                          </span>
                          <span className="mt-0.5 block truncate font-body text-xs text-charcoal">
                            {m.setName}
                          </span>
                          <span className="mt-2 flex items-center justify-between gap-2">
                            <span className="font-mono text-sm tabular-nums text-stamp">
                              {formatCurrency(m.price)}
                            </span>
                            <MiniSpark values={m.spark} up={m.change >= 0} />
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="cf-panel overflow-hidden">
            <div className="border-b-2 border-ink bg-cream/50 px-4 py-3">
              <h2 className="font-display text-lg text-ink">Set momentum</h2>
              <p className="mt-1 font-body text-xs text-charcoal">
                Average change across cards in each set (from your price history)
              </p>
            </div>
            {(insights?.setTrends.length ?? 0) === 0 ? (
              <p className="px-4 py-10 text-center font-body text-sm text-charcoal">
                Set trends appear once multiple cards in a set have price history.
              </p>
            ) : (
              <ul className="divide-y divide-ink/10">
                {insights!.setTrends.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm font-medium text-ink">
                        {s.name}
                      </p>
                      <p className="font-mono text-[0.65rem] tracking-wide text-sage uppercase">
                        {s.sport} · {s.cardCount} card{s.cardCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="h-2 border border-ink/30 bg-cream">
                        <div
                          className={`h-full ${s.change >= 0 ? "bg-sage" : "bg-stamp"}`}
                          style={{
                            width: `${Math.min(100, Math.abs(s.change) * 8)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <ChangeBadge value={s.change} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <UpgradePopup
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Pro unlocks movers, set trends, and collection-linked value change."
      />
    </div>
  );
}

function LockedMarketPreview({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="cf-panel p-6 text-center min-[900px]:p-10">
      <p className="cf-label mb-3 inline-block border border-ink/25 bg-cream px-2 py-1">
        Pro
      </p>
      <h2 className="font-display text-xl text-ink">
        Market trends are a Pro feature
      </h2>
      <p className="mx-auto mt-2 max-w-md font-body text-sm text-charcoal">
        See which cards in your catalog are climbing or falling, set momentum,
        and 30-day collection value change — all from your real price history.
      </p>
      <button type="button" onClick={onUpgrade} className="cf-btn cf-btn-primary mt-6">
        Upgrade to Pro
      </button>
    </div>
  );
}

function EmptyMovers() {
  return (
    <div className="px-4 py-12 text-center">
      <h3 className="font-display text-lg text-ink">No movers yet</h3>
      <p className="mx-auto mt-2 max-w-sm font-body text-sm text-charcoal">
        Log a second price on a card (manual update on the card page) to start
        tracking gains and losses.
      </p>
      <Link href="/app/collection" className="cf-btn mt-5">
        Go to collection
      </Link>
    </div>
  );
}

function ChangeBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex border px-2 py-0.5 font-mono text-xs tabular-nums ${
        up
          ? "border-sage/40 bg-cream text-sage"
          : "border-stamp/40 bg-cream text-stamp"
      }`}
    >
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function MiniSpark({ values, up }: { values: number[]; up: boolean }) {
  if (values.length < 2) {
    return <span className="font-mono text-xs text-sage">—</span>;
  }
  const { line } = sparkPath(values, 56, 20);
  return (
    <svg
      viewBox="0 0 56 20"
      className={`h-5 w-14 ${up ? "text-sage" : "text-stamp"}`}
      aria-hidden
    >
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function sparkPath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return { line: "", area: "" };
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(0.001, max - min);
  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return { line, area };
}
