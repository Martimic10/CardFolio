import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import {
  appUrl,
  getStripe,
  isBillingMockMode,
  priceIdForPlan,
  stripeConfigured,
} from "@/lib/billing";
import { hasProAccess, isValidPlan, type PlanId } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getAppUser();
    const body = await request.json();
    const plan = body.plan as string;

    if (plan !== "pro_monthly" && plan !== "pro_lifetime") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (hasProAccess(user) && user.plan === "pro_lifetime") {
      return NextResponse.json(
        { error: "You already have Pro Lifetime." },
        { status: 400 },
      );
    }

    // Mock billing: instantly grant the plan (no Stripe keys required).
    if (isBillingMockMode()) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          plan,
          stripeCustomerId: user.stripeCustomerId ?? `mock_cus_${user.id}`,
          stripeSubscriptionId:
            plan === "pro_monthly" ? `mock_sub_${user.id}` : null,
        },
      });

      return NextResponse.json({
        mock: true,
        plan: updated.plan,
        url: `${appUrl()}/app/account?upgraded=1`,
      });
    }

    const stripe = getStripe();
    const priceId = priceIdForPlan(plan);
    if (!stripe || !priceId) {
      return NextResponse.json(
        {
          error: stripeConfigured()
            ? "Stripe client failed to initialize"
            : "Stripe is not fully configured. Add STRIPE_SECRET_KEY, STRIPE_PRICE_PRO_MONTHLY, and STRIPE_PRICE_PRO_LIFETIME, then set BILLING_MOCK=false.",
        },
        { status: 503 },
      );
    }

    let customerId = user.stripeCustomerId;
    if (!customerId || customerId.startsWith("mock_cus_")) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id, clerkUserId: user.clerkUserId ?? "" },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: plan === "pro_monthly" ? "subscription" : "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl()}/app/account?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/app/account?canceled=1`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data:
        plan === "pro_monthly"
          ? { metadata: { userId: user.id, plan } }
          : undefined,
      payment_intent_data:
        plan === "pro_lifetime"
          ? { metadata: { userId: user.id, plan } }
          : undefined,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, mock: false });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Dev helper: set plan without checkout (mock only). */
export async function PATCH(request: NextRequest) {
  try {
    if (!isBillingMockMode()) {
      return NextResponse.json({ error: "Mock only" }, { status: 403 });
    }
    const user = await getAppUser();
    const body = await request.json();
    const plan = body.plan as string;
    if (!isValidPlan(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: plan as PlanId,
        stripeSubscriptionId:
          plan === "pro_monthly" ? `mock_sub_${user.id}` : null,
      },
    });
    return NextResponse.json({ plan: updated.plan });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
