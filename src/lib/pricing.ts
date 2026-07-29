/**
 * Pluggable price estimate. Placeholder heuristic until live comps are wired.
 * Pro-gated automatic lookup — free users only get a value when they enter one manually.
 */
export function estimatePrice(input: {
  year: number;
  sport: string;
  grade?: number | null;
  startingPrice?: number | null;
}): number {
  if (input.startingPrice != null && input.startingPrice > 0) {
    return round2(input.startingPrice);
  }

  const age = Math.max(0, new Date().getFullYear() - input.year);
  let base = 8 + Math.min(age, 40) * 0.85;

  const sportBoost: Record<string, number> = {
    Baseball: 1.15,
    Basketball: 1.25,
    Football: 1.1,
    Hockey: 1.0,
    Soccer: 0.95,
    Pokémon: 1.35,
    "Magic: The Gathering": 1.4,
    "Yu-Gi-Oh!": 1.2,
    Lorcana: 1.15,
    "One Piece": 1.25,
    "Other TCG": 1.1,
    Other: 0.9,
  };
  base *= sportBoost[input.sport] ?? 1;

  if (input.grade != null) {
    const g = input.grade;
    if (g >= 9.5) base *= 2.4;
    else if (g >= 9) base *= 1.8;
    else if (g >= 8) base *= 1.35;
    else if (g >= 7) base *= 1.1;
    else if (g < 5) base *= 0.65;
  }

  return round2(base);
}

/**
 * Automatic comps/estimate lookup. Gate behind Pro so free users never trigger
 * paid API calls once this is wired to a real provider.
 */
export function getPriceEstimate(
  input: {
    year: number;
    sport: string;
    grade?: number | null;
    startingPrice?: number | null;
  },
  opts: { hasProAccess: boolean },
): { amount: number; source: string } | null {
  if (input.startingPrice != null && input.startingPrice > 0) {
    return { amount: round2(input.startingPrice), source: "manual" };
  }
  if (!opts.hasProAccess) {
    return null;
  }
  return { amount: estimatePrice(input), source: "estimate" };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
