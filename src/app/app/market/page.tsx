"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMe, fetchSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/pricing";
import { UpgradePopup } from "@/components/app/UpgradePopup";

type Mover = {
  player: string;
  set: string;
  sport: string;
  price: number;
  change: number;
  spark: number[];
};

type SetTrend = {
  name: string;
  sport: string;
  change: number;
  volume: string;
};

const TOP_GAINERS: Mover[] = [
  {
    player: "Ken Griffey Jr.",
    set: "1989 Upper Deck #1",
    sport: "Baseball",
    price: 142.5,
    change: 12.4,
    spark: [8, 9, 8, 10, 11, 12, 14],
  },
  {
    player: "Charizard",
    set: "Base Set Holo #4",
    sport: "Pokémon",
    price: 312.0,
    change: 8.1,
    spark: [20, 19, 21, 22, 24, 25, 28],
  },
  {
    player: "Luka Dončić",
    set: "2018 Prizm Silver",
    sport: "Basketball",
    price: 89.0,
    change: 6.7,
    spark: [12, 11, 13, 12, 14, 15, 16],
  },
  {
    player: "Black Lotus",
    set: "Unlimited",
    sport: "Magic: The Gathering",
    price: 12400,
    change: 4.2,
    spark: [40, 41, 39, 42, 43, 44, 45],
  },
];

const TOP_LOSERS: Mover[] = [
  {
    player: "Patrick Mahomes",
    set: "2017 Prizm Rookie",
    sport: "Football",
    price: 210.0,
    change: -5.3,
    spark: [18, 17, 16, 17, 15, 14, 13],
  },
  {
    player: "Pikachu Illustrator",
    set: "Promo (proxy comps)",
    sport: "Pokémon",
    price: 980.0,
    change: -3.8,
    spark: [30, 29, 28, 29, 27, 26, 25],
  },
  {
    player: "Connor McDavid",
    set: "2015 Upper Deck Young Guns",
    sport: "Hockey",
    price: 64.0,
    change: -2.9,
    spark: [10, 10, 9, 9, 8, 8, 7],
  },
];

const SET_TRENDS: SetTrend[] = [
  { name: "1999 Base Set", sport: "Pokémon", change: 9.2, volume: "High" },
  { name: "2018 Prizm", sport: "Basketball", change: 5.4, volume: "Med" },
  { name: "1986 Fleer", sport: "Basketball", change: 3.1, volume: "Med" },
  { name: "Modern Horizon 3", sport: "MTG", change: -1.8, volume: "High" },
  { name: "2020 Mosaic", sport: "Football", change: -4.6, volume: "Low" },
];

const INDEX_POINTS = [42, 44, 43, 46, 48, 47, 51, 53, 52, 55, 58, 57];

export default function MarketTrendsPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const summaryQuery = useQuery({ queryKey: ["summary"], queryFn: fetchSummary });
  const hasPro = meQuery.data?.hasProAccess ?? false;

  const movers = tab === "gainers" ? TOP_GAINERS : TOP_LOSERS;

  const indexPath = useMemo(() => sparkPath(INDEX_POINTS, 280, 72), []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 min-[900px]:space-y-6">
      <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between">
        <div>
          <p className="cf-label mb-2">Market desk</p>
          <h1 className="font-display text-2xl text-ink min-[900px]:text-3xl">
            Market trends
          </h1>
          <p className="mt-2 max-w-lg font-body text-sm text-charcoal">
            Sample market pulse — movers, set momentum, and index direction.
            Live comps tied to your collection come next.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-ink/30 bg-cream px-2 py-1 font-mono text-[0.6rem] tracking-wide text-sage uppercase">
            Sample data
          </span>
          {!hasPro && (
            <button
              type="button"
              onClick={() => setUpgradeOpen(true)}
              className="cf-btn cf-btn-primary"
            >
              Unlock live Pro data
            </button>
          )}
        </div>
      </div>

      {!hasPro && (
        <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">
              Preview mode — upgrade for live market tools
            </h2>
            <p className="mt-1 font-body text-sm text-charcoal">
              You’re browsing sample comps. Pro connects movers and 30-day
              change to your actual catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="cf-btn cf-btn-primary shrink-0"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Index + collection snapshot */}
      <div className="grid gap-3 min-[900px]:grid-cols-[1.4fr_1fr]">
        <section className="cf-panel p-4 min-[900px]:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="cf-label">Cardfolio sample index</p>
              <p className="mt-1 font-mono text-2xl font-medium tabular-nums text-ink">
                1,284.6
              </p>
              <p className="mt-1 font-mono text-sm tabular-nums text-sage">
                +3.8% · 30 days
              </p>
            </div>
            <span className="border-2 border-ink bg-cream px-2 py-1 font-mono text-[0.6rem] text-sage uppercase">
              12 wk
            </span>
          </div>
          <svg
            viewBox="0 0 280 72"
            className="h-20 w-full text-ink"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={indexPath.area}
              fill="currentColor"
              className="opacity-[0.08]"
            />
            <path
              d={indexPath.line}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </section>

        <section className="cf-panel p-4 min-[900px]:p-5">
          <p className="cf-label mb-3">Your catalog</p>
          <dl className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-dotted border-manila pb-2">
              <dt className="font-body text-sm text-charcoal">Cards filed</dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-ink">
                {summaryQuery.isLoading
                  ? "—"
                  : (summaryQuery.data?.uniqueCards ?? 0)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-b border-dotted border-manila pb-2">
              <dt className="font-body text-sm text-charcoal">Est. value</dt>
              <dd className="font-mono text-sm font-medium tabular-nums text-stamp">
                {summaryQuery.isLoading
                  ? "—"
                  : formatCurrency(summaryQuery.data?.totalValue ?? 0)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="font-body text-sm text-charcoal">30-day change</dt>
              <dd>
                {hasPro ? (
                  <span className="font-mono text-sm tabular-nums text-sage">
                    —
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className="inline-flex items-center gap-1 border border-ink/25 bg-cream px-2 py-0.5 font-mono text-[0.65rem] text-sage uppercase"
                  >
                    <LockIcon /> Pro
                  </button>
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

      {/* Movers */}
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

        {/* Desktop table */}
        <div className="hidden min-[900px]:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink/20 bg-cream">
                {["Card", "Category", "Price", "30d", "Trend"].map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    <span className="cf-label">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movers.map((m) => (
                <tr
                  key={`${m.player}-${m.set}`}
                  className="border-b border-ink/10 last:border-b-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-body text-sm font-medium text-ink">
                      {m.player}
                    </p>
                    <p className="font-body text-xs text-charcoal">{m.set}</p>
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

        {/* Mobile list */}
        <ul className="divide-y divide-ink/10 min-[900px]:hidden">
          {movers.map((m) => (
            <li key={`${m.player}-${m.set}`} className="flex gap-3 px-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-body text-sm font-medium text-ink">
                    {m.player}
                  </p>
                  <ChangeBadge value={m.change} />
                </div>
                <p className="mt-0.5 truncate font-body text-xs text-charcoal">
                  {m.set}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm tabular-nums text-stamp">
                    {formatCurrency(m.price)}
                  </span>
                  <MiniSpark values={m.spark} up={m.change >= 0} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Set trends */}
      <section className="cf-panel overflow-hidden">
        <div className="border-b-2 border-ink bg-cream/50 px-4 py-3">
          <h2 className="font-display text-lg text-ink">Set momentum</h2>
          <p className="mt-1 font-body text-xs text-charcoal">
            Average 30-day move across popular sets
          </p>
        </div>
        <ul className="divide-y divide-ink/10">
          {SET_TRENDS.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-ink">
                  {s.name}
                </p>
                <p className="font-mono text-[0.65rem] tracking-wide text-sage uppercase">
                  {s.sport} · vol {s.volume}
                </p>
              </div>
              <div className="w-24 shrink-0">
                <div className="h-2 border border-ink/30 bg-cream">
                  <div
                    className={`h-full ${
                      s.change >= 0 ? "bg-sage" : "bg-stamp"
                    }`}
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
      </section>

      <p className="font-mono text-[0.6rem] tracking-wide text-sage uppercase">
        Illustrative sample only · not live market data
      </p>

      <UpgradePopup
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Pro unlocks live movers, set trends, and collection-linked comps."
      />
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

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M8 11V8a4 4 0 018 0v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
