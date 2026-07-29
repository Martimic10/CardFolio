export type PricePoint = {
  amount: number;
  createdAt: Date;
};

export type CardMarketInput = {
  id: string;
  player: string;
  sport: string;
  setName: string;
  quantity: number;
  prices: PricePoint[];
};

export type MoverInsight = {
  cardId: string;
  player: string;
  setName: string;
  sport: string;
  price: number;
  change: number;
  spark: number[];
};

export type SetTrendInsight = {
  name: string;
  sport: string;
  change: number;
  cardCount: number;
};

export type MarketInsights = {
  totalValue: number;
  change30dPct: number | null;
  change30dAmount: number | null;
  topMover: MoverInsight | null;
  gainers: MoverInsight[];
  losers: MoverInsight[];
  setTrends: SetTrendInsight[];
  /** Portfolio value samples oldest → newest for charting. */
  indexSpark: number[];
  cardsWithHistory: number;
};

const MS_DAY = 24 * 60 * 60 * 1000;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function pctChange(from: number, to: number): number | null {
  if (from <= 0) return null;
  return round2(((to - from) / from) * 100);
}

/** Prices should be newest-first. */
export function sparkFromPrices(prices: PricePoint[], maxPoints = 8): number[] {
  if (!prices.length) return [];
  const chronological = [...prices].reverse().slice(-maxPoints);
  return chronological.map((p) => p.amount);
}

/** 30-day (or oldest available) % change. Prices newest-first. */
export function cardChangePct(prices: PricePoint[]): number | null {
  if (prices.length < 2) return null;
  const latest = prices[0]!;
  const cutoff = Date.now() - 30 * MS_DAY;
  const baseline =
    prices.find((p) => p.createdAt.getTime() <= cutoff) ??
    prices[prices.length - 1]!;
  if (baseline.createdAt.getTime() === latest.createdAt.getTime()) return null;
  return pctChange(baseline.amount, latest.amount);
}

function toMover(card: CardMarketInput, change: number): MoverInsight {
  return {
    cardId: card.id,
    player: card.player,
    setName: card.setName,
    sport: card.sport,
    price: card.prices[0]?.amount ?? 0,
    change,
    spark: sparkFromPrices(card.prices),
  };
}

/**
 * Build collection market insights from cards + price history (newest-first prices).
 */
export function buildMarketInsights(cards: CardMarketInput[]): MarketInsights {
  const totalValue = round2(
    cards.reduce(
      (sum, c) => sum + (c.prices[0]?.amount ?? 0) * c.quantity,
      0,
    ),
  );

  const cutoff = Date.now() - 30 * MS_DAY;
  let pastValue = 0;
  let comparable = false;
  for (const card of cards) {
    if (card.prices.length < 2) {
      pastValue += (card.prices[0]?.amount ?? 0) * card.quantity;
      continue;
    }
    const past =
      card.prices.find((p) => p.createdAt.getTime() <= cutoff) ??
      card.prices[card.prices.length - 1]!;
    const latest = card.prices[0]!;
    if (past.createdAt.getTime() !== latest.createdAt.getTime()) {
      comparable = true;
    }
    pastValue += past.amount * card.quantity;
  }

  const change30dAmount = comparable ? round2(totalValue - pastValue) : null;
  const change30dPct =
    comparable && pastValue > 0 ? pctChange(pastValue, totalValue) : null;

  const movers: MoverInsight[] = [];
  for (const card of cards) {
    const change = cardChangePct(card.prices);
    if (change == null) continue;
    movers.push(toMover(card, change));
  }
  movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const gainers = movers
    .filter((m) => m.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 8);
  const losers = movers
    .filter((m) => m.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 8);

  const topMover = movers[0] ?? null;

  const setMap = new Map<
    string,
    { sport: string; changes: number[]; count: number }
  >();
  for (const card of cards) {
    const change = cardChangePct(card.prices);
    if (change == null) continue;
    const existing = setMap.get(card.setName) ?? {
      sport: card.sport,
      changes: [],
      count: 0,
    };
    existing.changes.push(change);
    existing.count += 1;
    setMap.set(card.setName, existing);
  }
  const setTrends: SetTrendInsight[] = [...setMap.entries()]
    .map(([name, data]) => ({
      name,
      sport: data.sport,
      change: round2(
        data.changes.reduce((a, b) => a + b, 0) / data.changes.length,
      ),
      cardCount: data.count,
    }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 8);

  return {
    totalValue,
    change30dPct,
    change30dAmount,
    topMover,
    gainers,
    losers,
    setTrends,
    indexSpark: buildIndexSpark(cards),
    cardsWithHistory: movers.length,
  };
}

function buildIndexSpark(cards: CardMarketInput[], points = 12): number[] {
  const times = new Set<number>();
  for (const card of cards) {
    for (const p of card.prices) {
      times.add(p.createdAt.getTime());
    }
  }
  if (times.size === 0) return totalOnlySpark(cards);

  const sortedTimes = [...times].sort((a, b) => a - b);
  const sampled: number[] = [];
  if (sortedTimes.length <= points) {
    sampled.push(...sortedTimes);
  } else {
    for (let i = 0; i < points; i++) {
      const idx = Math.round((i / (points - 1)) * (sortedTimes.length - 1));
      sampled.push(sortedTimes[idx]!);
    }
  }

  return sampled.map((t) => {
    let value = 0;
    for (const card of cards) {
      // prices are newest-first; find newest at or before t
      const atOrBefore = [...card.prices]
        .reverse()
        .filter((p) => p.createdAt.getTime() <= t)
        .at(-1);
      if (atOrBefore) {
        value += atOrBefore.amount * card.quantity;
      }
    }
    return round2(value);
  });
}

function totalOnlySpark(cards: CardMarketInput[]): number[] {
  const total = round2(
    cards.reduce(
      (sum, c) => sum + (c.prices[0]?.amount ?? 0) * c.quantity,
      0,
    ),
  );
  return total > 0 ? [total] : [];
}

export function cardTrendFields(prices: PricePoint[]) {
  return {
    priceChangePct: cardChangePct(prices),
    priceSpark: sparkFromPrices(prices),
  };
}
