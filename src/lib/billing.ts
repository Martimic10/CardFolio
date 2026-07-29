import Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

/**
 * Mock when explicitly enabled, or when the secret key is missing.
 * Set BILLING_MOCK=false once Stripe test keys + price IDs are in .env.
 */
export function isBillingMockMode() {
  if (process.env.BILLING_MOCK === "true") return true;
  if (process.env.BILLING_MOCK === "false") return false;
  return !process.env.STRIPE_SECRET_KEY;
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function priceIdForPlan(plan: Exclude<PlanId, "free">): string | null {
  if (plan === "pro_monthly") {
    return process.env.STRIPE_PRICE_PRO_MONTHLY ?? null;
  }
  return process.env.STRIPE_PRICE_PRO_LIFETIME ?? null;
}

export function planFromPriceId(
  priceId: string,
): Exclude<PlanId, "free"> | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
    return "pro_monthly";
  }
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO_LIFETIME) {
    return "pro_lifetime";
  }
  return null;
}

export function stripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_PRO_MONTHLY &&
      process.env.STRIPE_PRICE_PRO_LIFETIME,
  );
}

export function appUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
