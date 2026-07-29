/**
 * Creates Cardfolio Pro products + prices in Stripe (test or live).
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/setup-stripe-prices.ts
 *
 * Paste the printed IDs into .env, then set BILLING_MOCK=false.
 */
import Stripe from "stripe";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("Set STRIPE_SECRET_KEY before running this script.");
    process.exit(1);
  }

  const stripe = new Stripe(key);

  const monthlyProduct = await stripe.products.create({
    name: "Cardfolio Pro Monthly",
    description: "Unlimited cards, auto pricing, price history, market trends.",
  });
  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 800,
    currency: "usd",
    recurring: { interval: "month" },
  });

  const lifetimeProduct = await stripe.products.create({
    name: "Cardfolio Pro Lifetime",
    description: "One-time payment for lifetime Pro access.",
  });
  const lifetimePrice = await stripe.prices.create({
    product: lifetimeProduct.id,
    unit_amount: 16000,
    currency: "usd",
  });

  console.log("\nAdd these to your .env:\n");
  console.log(`STRIPE_SECRET_KEY="${key.slice(0, 12)}…"`);
  console.log(`STRIPE_PRICE_PRO_MONTHLY="${monthlyPrice.id}"`);
  console.log(`STRIPE_PRICE_PRO_LIFETIME="${lifetimePrice.id}"`);
  console.log(`BILLING_MOCK="false"`);
  console.log(
    `\nThen run: stripe listen --forward-to localhost:3000/api/webhooks/stripe`,
  );
  console.log("and put the whsec_… value in STRIPE_WEBHOOK_SECRET.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
