export const FREE_CARD_LIMIT = 50;

export type PlanId = "free" | "pro_monthly" | "pro_lifetime";

export type PlanUser = {
  plan: string;
};

export function hasProAccess(user: PlanUser): boolean {
  return user.plan === "pro_monthly" || user.plan === "pro_lifetime";
}

export function isValidPlan(plan: string): plan is PlanId {
  return plan === "free" || plan === "pro_monthly" || plan === "pro_lifetime";
}

export function planLabel(plan: string): string {
  switch (plan) {
    case "pro_monthly":
      return "Pro Monthly";
    case "pro_lifetime":
      return "Pro Lifetime";
    default:
      return "Free";
  }
}

export const PRO_PLANS = [
  {
    id: "pro_monthly" as const,
    name: "Pro Monthly",
    priceLabel: "$8/mo",
    description: "Unlimited cards, auto pricing, and price history.",
    priceCents: 800,
    mode: "subscription" as const,
  },
  {
    id: "pro_lifetime" as const,
    name: "Pro Lifetime",
    priceLabel: "$160 once",
    description: "Pay once. Keep Pro forever — no renewals.",
    priceCents: 16000,
    mode: "payment" as const,
  },
] as const;
