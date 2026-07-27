"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCards, fetchSummary } from "@/lib/api";
import {
  CATEGORY_FILTER_OPTIONS,
  categoryShortCode,
} from "@/lib/categories";
import { formatCurrency } from "@/lib/pricing";
import type { CardListItem } from "@/lib/validators";

type ViewMode = "table" | "grid";

export function CollectionDashboard() {
  const [view, setView] = useState<ViewMode>("table");
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sport) p.set("sport", sport);
    p.set("sort", sort);
    p.set("order", order);
    if (minValue) p.set("minValue", minValue);
    if (maxValue) p.set("maxValue", maxValue);
    return p;
  }, [q, sport, sort, order, minValue, maxValue]);

  const cardsQuery = useQuery({
    queryKey: ["cards", params.toString()],
    queryFn: () => fetchCards(params),
  });

  const summaryQuery = useQuery({
    queryKey: ["summary"],
    queryFn: fetchSummary,
  });

  function toggleSort(column: string) {
    if (sort === column) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(column);
      setOrder(column === "player" || column === "setName" ? "asc" : "desc");
    }
  }

  const cards = cardsQuery.data ?? [];
  const isEmpty =
    !cardsQuery.isLoading &&
    cards.length === 0 &&
    !q &&
    !sport &&
    !minValue &&
    !maxValue;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="cf-label mb-2">Catalog index</p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl md:text-4xl">
            Collection
          </h1>
          <p className="mt-2 max-w-md text-sm text-charcoal">
            Sports and TCG — browse, search, and manage every card you&apos;ve
            filed.
          </p>
        </div>
        <div className="hidden md:block">
          <Link href="/app/cards/new" className="cf-btn cf-btn-primary">
            Add card
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Total cards"
          value={
            summaryQuery.isLoading
              ? "—"
              : String(summaryQuery.data?.totalCards ?? 0)
          }
        />
        <SummaryCard
          label="Unique entries"
          value={
            summaryQuery.isLoading
              ? "—"
              : String(summaryQuery.data?.uniqueCards ?? 0)
          }
        />
        <SummaryCard
          label="Estimated value"
          value={
            summaryQuery.isLoading
              ? "—"
              : formatCurrency(summaryQuery.data?.totalValue ?? 0)
          }
          accent
        />
      </div>

      <div className="cf-panel p-3 sm:p-4 md:p-5">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cf-label">Search</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, set, or number"
              className="cf-input"
              inputMode="search"
            />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <span className="cf-label">Category</span>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="cf-input"
              >
                {CATEGORY_FILTER_OPTIONS.map((s) => (
                  <option key={s || "all"} value={s}>
                    {s || "All categories"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="cf-label">Min value</span>
              <input
                type="number"
                min={0}
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="cf-input font-mono"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="cf-label">Max value</span>
              <input
                type="number"
                min={0}
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="cf-input font-mono"
              />
            </label>
            <div className="flex border-2 border-ink self-end">
              <button
                type="button"
                onClick={() => setView("table")}
                className={`min-h-11 flex-1 px-3 py-2 font-body text-sm sm:flex-none ${
                  view === "table"
                    ? "bg-ink text-paper"
                    : "bg-paper text-charcoal"
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`min-h-11 flex-1 border-l-2 border-ink px-3 py-2 font-body text-sm sm:flex-none ${
                  view === "grid"
                    ? "bg-ink text-paper"
                    : "bg-paper text-charcoal"
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {cardsQuery.isLoading && (
        <div className="cf-panel px-6 py-16 text-center font-body text-sm text-charcoal">
          Loading collection…
        </div>
      )}

      {cardsQuery.isError && (
        <div className="border-2 border-stamp bg-paper px-6 py-4 font-body text-sm text-stamp">
          Couldn&apos;t load your cards.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => cardsQuery.refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {isEmpty && (
        <div className="cf-panel border-dashed px-6 py-16 text-center">
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
          <div className="cf-panel px-6 py-12 text-center font-body text-sm text-charcoal">
            No cards match these filters.
          </div>
        )}

      {!cardsQuery.isLoading && cards.length > 0 && view === "table" && (
        <CardTable cards={cards} sort={sort} order={order} onSort={toggleSort} />
      )}

      {!cardsQuery.isLoading && cards.length > 0 && view === "grid" && (
        <CardGrid cards={cards} />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`cf-panel border-t-4 px-4 py-4 ${
        accent ? "border-t-stamp" : "border-t-manila"
      }`}
    >
      <p className="cf-label">{label}</p>
      <p
        className={`mt-2 font-mono text-2xl tracking-tight ${
          accent ? "text-stamp" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CardTable({
  cards,
  sort,
  order,
  onSort,
}: {
  cards: CardListItem[];
  sort: string;
  order: "asc" | "desc";
  onSort: (column: string) => void;
}) {
  const cols = [
    { key: "player", label: "Name" },
    { key: "setName", label: "Set" },
    { key: "year", label: "Year" },
    { key: "grade", label: "Grade" },
    { key: "value", label: "Value" },
  ] as const;

  return (
    <>
      {/* Mobile-friendly stacked list */}
      <div className="cf-panel divide-y divide-ink/15 md:hidden">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={`/app/cards/${card.id}`}
            className="flex items-center gap-3 px-3 py-3 no-underline active:bg-cream"
          >
            <Thumb url={card.thumbnailUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base text-ink">
                {card.player}
              </p>
              <p className="truncate font-body text-xs text-charcoal">
                {card.year}
                {card.brand ? ` · ${card.brand}` : ""} · {card.setName}
                {card.cardNumber ? ` #${card.cardNumber}` : ""}
              </p>
              <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-sage">
                {categoryShortCode(card.sport)}
                {card.grade != null ? ` · GR ${card.grade.toFixed(1)}` : ""}
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm font-medium text-stamp">
              {card.estimatedValue != null
                ? formatCurrency(card.estimatedValue)
                : "—"}
            </span>
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="cf-panel hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left font-body text-sm">
          <thead className="border-b-2 border-ink bg-cream/80">
            <tr>
              <th className="px-4 py-3">
                <span className="cf-label">Card</span>
              </th>
              {cols.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="cf-label inline-flex items-center gap-1 hover:text-ink"
                  >
                    {col.label}
                    {sort === col.key && (
                      <span className="font-mono normal-case tracking-normal">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr
                key={card.id}
                className="border-b border-ink/15 last:border-0 hover:bg-cream/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/app/cards/${card.id}`}
                    className="flex items-center gap-3 no-underline"
                  >
                    <Thumb url={card.thumbnailUrl} />
                    <span className="flex flex-col">
                      <span className="font-display text-base text-ink">
                        {card.player}
                      </span>
                      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-sage">
                        {categoryShortCode(card.sport)}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-charcoal">
                  {card.brand ? `${card.brand} · ` : ""}
                  {card.setName}
                  {card.cardNumber ? ` #${card.cardNumber}` : ""}
                </td>
                <td className="px-4 py-3 font-mono text-charcoal">{card.year}</td>
                <td className="px-4 py-3 font-mono text-charcoal">
                  {card.grade != null ? card.grade.toFixed(1) : "—"}
                </td>
                <td className="px-4 py-3 font-mono font-medium text-stamp">
                  {card.estimatedValue != null
                    ? formatCurrency(card.estimatedValue)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CardGrid({ cards }: { cards: CardListItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/app/cards/${card.id}`}
          className="cf-panel relative p-3 no-underline shadow-[4px_4px_0_rgba(34,40,58,0.08)] sm:p-4"
        >
          <span className="absolute -top-2 right-3 border border-ink bg-manila px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-ink">
            {categoryShortCode(card.sport)}
          </span>
          <div className="mb-3 mx-auto aspect-[2.5/3.5] max-w-[200px] overflow-hidden border border-dashed border-manila bg-cream sm:mx-0 sm:max-w-none">
            {card.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs tracking-wider text-sage">
                NO PHOTO
              </div>
            )}
          </div>
          <h3 className="font-display text-lg text-ink">{card.player}</h3>
          <p className="mt-1 font-body text-sm text-charcoal">
            {card.year}
            {card.brand ? ` · ${card.brand}` : ""} · {card.setName}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-dotted border-manila pt-3 text-sm">
            <span className="font-mono text-sage">
              {card.grade != null ? `GR ${card.grade.toFixed(1)}` : "UNGR"}
            </span>
            <span className="font-mono font-medium text-stamp">
              {card.estimatedValue != null
                ? formatCurrency(card.estimatedValue)
                : "—"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Thumb({ url }: { url: string | null }) {
  return (
    <div className="h-10 w-8 shrink-0 overflow-hidden border border-ink/30 bg-cream">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
