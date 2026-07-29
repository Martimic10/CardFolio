"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCards, fetchMe, fetchMarketInsights, fetchSummary } from "@/lib/api";
import {
  CATEGORY_FILTER_OPTIONS,
  categoryShortCode,
} from "@/lib/categories";
import { gradeLabel } from "@/lib/condition";
import { formatCurrency } from "@/lib/pricing";
import { UpgradePopup } from "@/components/app/UpgradePopup";

export function CollectionDashboard() {
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [conditionFilter, setConditionFilter] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sport) p.set("sport", sport);
    p.set("sort", sort);
    p.set("order", order);
    return p;
  }, [q, sport, sort, order]);

  const cardsQuery = useQuery({
    queryKey: ["cards", params.toString()],
    queryFn: () => fetchCards(params),
  });

  const summaryQuery = useQuery({
    queryKey: ["summary"],
    queryFn: fetchSummary,
  });

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const hasPro = meQuery.data?.hasProAccess ?? false;

  const marketQuery = useQuery({
    queryKey: ["market"],
    queryFn: fetchMarketInsights,
    enabled: hasPro,
    retry: false,
  });

  const cards = useMemo(() => {
    let list = cardsQuery.data ?? [];
    if (conditionFilter === "graded") {
      list = list.filter((c) => c.grade != null && c.grade >= 7);
    } else if (conditionFilter === "raw") {
      list = list.filter((c) => c.grade == null || c.grade < 7);
    }
    return list;
  }, [cardsQuery.data, conditionFilter]);

  const lastAdded =
    cardsQuery.data && cardsQuery.data.length > 0
      ? new Date(
          [...cardsQuery.data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0]!.createdAt,
        ).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const uniqueCount = summaryQuery.data?.uniqueCards ?? 0;
  const isEmpty =
    !cardsQuery.isLoading &&
    (cardsQuery.data?.length ?? 0) === 0 &&
    !q &&
    !sport &&
    !conditionFilter;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 min-[900px]:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="cf-label mb-2">Catalog index</p>
          <h1 className="font-display text-2xl text-ink min-[900px]:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 font-body text-sm text-charcoal">
            <span className="font-mono tabular-nums">{uniqueCount}</span> cards
            {lastAdded ? ` · Last added ${lastAdded}` : ""}
          </p>
        </div>
        <Link
          href="/app/cards/new"
          className="cf-btn cf-btn-primary hidden shadow-[3px_3px_0_rgba(34,40,58,0.15)] min-[900px]:inline-flex"
        >
          + Add card
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
        <StatCard
          label="Total cards"
          value={
            summaryQuery.isLoading
              ? "—"
              : String(summaryQuery.data?.totalCards ?? 0)
          }
        />
        <StatCard
          label="Estimated value"
          value={
            summaryQuery.isLoading
              ? "—"
              : formatCurrency(summaryQuery.data?.totalValue ?? 0)
          }
          accent
        />
        <StatCard
          label="30-day change"
          locked={!hasPro}
          onUnlock={() => setUpgradeOpen(true)}
          value={
            marketQuery.isLoading
              ? "…"
              : marketQuery.data?.insights.change30dPct != null
                ? `${marketQuery.data.insights.change30dPct >= 0 ? "+" : ""}${marketQuery.data.insights.change30dPct.toFixed(1)}%`
                : "—"
          }
        />
        <StatCard
          label="Top mover"
          locked={!hasPro}
          onUnlock={() => setUpgradeOpen(true)}
          value={
            marketQuery.isLoading
              ? "…"
              : marketQuery.data?.insights.topMover
                ? `${marketQuery.data.insights.topMover.player} ${
                    marketQuery.data.insights.topMover.change >= 0 ? "+" : ""
                  }${marketQuery.data.insights.topMover.change.toFixed(1)}%`
                : "—"
          }
        />
      </div>

      {meQuery.data && !hasPro && (
        <div className="flex flex-col gap-3 border-2 border-ink bg-paper p-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
          <div>
            <h2 className="font-display text-lg text-ink">
              Unlock market insights with Pro
            </h2>
            <p className="mt-1 max-w-xl font-body text-sm text-charcoal">
              See 30-day value changes, top movers, price history, and market
              trends. Free includes up to {meQuery.data.cardLimit} cards (
              {meQuery.data.uniqueCards}/{meQuery.data.cardLimit} used).
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

      <section className="cf-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b-2 border-ink bg-cream/50 p-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:p-4">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search player, set, brand…"
            className="cf-input min-[900px]:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={!sport}
              onClick={() => setSport("")}
              label="All"
            />
            {CATEGORY_FILTER_OPTIONS.filter(Boolean)
              .slice(0, 6)
              .map((c) => (
                <FilterChip
                  key={c}
                  active={sport === c}
                  onClick={() => setSport(sport === c ? "" : c)}
                  label={categoryShortCode(c)}
                />
              ))}
            <FilterChip
              active={conditionFilter === "graded"}
              onClick={() =>
                setConditionFilter((v) => (v === "graded" ? "" : "graded"))
              }
              label="Graded"
            />
            <select
              value={`${sort}:${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split(":") as [
                  string,
                  "asc" | "desc",
                ];
                setSort(s);
                setOrder(o);
              }}
              className="border-1.5 border border-ink bg-cream px-2 py-1.5 font-mono text-xs text-ink"
            >
              <option value="createdAt:desc">Newest</option>
              <option value="value:desc">Value ↓</option>
              <option value="value:asc">Value ↑</option>
              <option value="player:asc">Player A–Z</option>
              <option value="year:desc">Year ↓</option>
            </select>
          </div>
        </div>

        {cardsQuery.isLoading && (
          <p className="px-4 py-16 text-center font-body text-sm text-charcoal">
            Loading collection…
          </p>
        )}

        {cardsQuery.isError && (
          <p className="px-4 py-10 text-center font-body text-sm text-stamp">
            Couldn&apos;t load your cards.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => cardsQuery.refetch()}
            >
              Try again
            </button>
          </p>
        )}

        {isEmpty && (
          <div className="border-t border-dashed border-manila px-4 py-16 text-center">
            <h2 className="font-display text-xl text-ink">No cards yet</h2>
            <p className="mx-auto mt-2 max-w-sm font-body text-sm text-charcoal">
              Add your first sports or TCG card to start building the catalog.
            </p>
            <Link href="/app/cards/new" className="cf-btn cf-btn-primary mt-6">
              Add your first card
            </Link>
          </div>
        )}

        {!cardsQuery.isLoading &&
          !cardsQuery.isError &&
          !isEmpty &&
          cards.length === 0 && (
            <p className="px-4 py-12 text-center font-body text-sm text-charcoal">
              No cards match these filters.
            </p>
          )}

        {cards.length > 0 && (
          <div className="hidden min-[900px]:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink/20 bg-cream">
                  {["Card", "Sport", "Condition", "Price", "Trend"].map((h) => (
                    <th key={h} className="px-4 py-2.5">
                      <span className="cf-label">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr
                    key={card.id}
                    className="border-b border-ink/10 last:border-b-0 hover:bg-cream/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/cards/${card.id}`}
                        className="flex items-center gap-3 no-underline"
                      >
                        <Thumb url={card.thumbnailUrl} />
                        <span className="min-w-0">
                          <span className="block truncate font-body text-sm font-medium text-ink">
                            {card.player}
                          </span>
                          <span className="block truncate font-body text-xs text-charcoal">
                            {card.year}
                            {card.brand ? ` · ${card.brand}` : ""} ·{" "}
                            {card.setName}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-charcoal">
                      {card.sport}
                    </td>
                    <td className="px-4 py-3">
                      <ConditionPill grade={card.grade} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium tabular-nums text-stamp">
                        {card.estimatedValue != null
                          ? formatCurrency(card.estimatedValue)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hasPro ? (
                        <CardTrend
                          change={card.priceChangePct}
                          spark={card.priceSpark}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUpgradeOpen(true)}
                          className="inline-flex items-center gap-1 border border-ink/25 bg-cream px-2 py-1 font-mono text-[0.65rem] text-sage uppercase"
                        >
                          <LockIcon /> Pro
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cards.length > 0 && (
          <ul className="divide-y divide-ink/10 min-[900px]:hidden">
            {cards.map((card) => (
              <li key={card.id}>
                <Link
                  href={`/app/cards/${card.id}`}
                  className="flex gap-3 px-3 py-3 no-underline"
                >
                  <Thumb url={card.thumbnailUrl} large />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate font-body text-sm font-medium text-ink">
                        {card.player}
                      </span>
                      <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-stamp">
                        {card.estimatedValue != null
                          ? formatCurrency(card.estimatedValue)
                          : "—"}
                      </span>
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="truncate font-body text-xs text-charcoal">
                        {card.setName}
                      </span>
                      <ConditionPill grade={card.grade} />
                      {!hasPro && (
                        <span className="inline-flex items-center gap-0.5 border border-ink/20 bg-cream px-1.5 py-0.5 font-mono text-[0.55rem] text-sage uppercase">
                          <LockIcon /> Pro
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <UpgradePopup
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Upgrade for market trends, 30-day value change, and price history."
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  locked,
  onUnlock,
  accent,
}: {
  label: string;
  value: string;
  locked?: boolean;
  onUnlock?: () => void;
  accent?: boolean;
}) {
  return (
    <div
      className={`border-2 border-ink p-3.5 min-[900px]:p-4 ${
        locked ? "bg-manila/25" : "bg-paper"
      }`}
    >
      <p className="cf-label">{label}</p>
      {locked ? (
        <button
          type="button"
          onClick={onUnlock}
          className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-sage uppercase"
        >
          <LockIcon /> Pro
        </button>
      ) : (
        <p
          className={`mt-2 font-mono text-xl font-medium tabular-nums ${
            accent ? "text-stamp" : "text-ink"
          } line-clamp-2 break-words text-[1.05rem] leading-snug`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-2 border-ink px-2.5 py-1 font-mono text-[0.65rem] tracking-wide uppercase transition-colors ${
        active ? "bg-ink text-paper" : "bg-paper text-charcoal hover:bg-cream"
      }`}
    >
      {label}
    </button>
  );
}

function ConditionPill({ grade }: { grade: number | null }) {
  if (grade == null) {
    return (
      <span className="inline-flex border border-ink/25 bg-cream px-2 py-0.5 font-mono text-[0.65rem] text-sage uppercase">
        Raw
      </span>
    );
  }
  return (
    <span className="inline-flex border border-ink bg-cream px-2 py-0.5 font-mono text-[0.65rem] text-ink">
      {gradeLabel(grade)}{" "}
      <span className="ml-0.5 tabular-nums text-stamp">{grade.toFixed(1)}</span>
    </span>
  );
}

function Thumb({ url, large }: { url: string | null; large?: boolean }) {
  return (
    <div
      className={`shrink-0 overflow-hidden border border-ink/40 bg-cream ${
        large ? "h-14 w-10" : "h-11 w-8"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}

function CardTrend({
  change,
  spark,
}: {
  change?: number | null;
  spark?: number[];
}) {
  if (change == null || !spark || spark.length < 2) {
    return <span className="font-mono text-xs text-sage">—</span>;
  }
  const up = change >= 0;
  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const range = Math.max(0.001, max - min);
  const w = 40;
  const h = 16;
  const line = spark
    .map((v, i) => {
      const x = (i / Math.max(1, spark.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden
        className={up ? "text-sage" : "text-stamp"}
      >
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`font-mono text-xs tabular-nums ${
          up ? "text-sage" : "text-stamp"
        }`}
      >
        {up ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </span>
  );
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
