import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { getStripe, planFromPriceId } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

/**
 * After Checkout redirect, sync the user's plan from the completed session.
 * Complements webhooks so local testing works even if the webhook is delayed.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAppUser();
    const body = await request.json();
    const sessionId = body.sessionId as string | undefined;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription"],
    });

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout session is not complete" },
        { status: 400 },
      );
    }

    const metaUserId = session.metadata?.userId ?? session.client_reference_id;
    if (metaUserId && metaUserId !== user.id) {
      return NextResponse.json({ error: "Session does not match user" }, { status: 403 });
    }

    let plan = session.metadata?.plan as string | undefined;
    if (!plan) {
      const priceId = session.line_items?.data?.[0]?.price?.id;
      if (priceId) {
        plan = planFromPriceId(priceId) ?? undefined;
      }
    }
    if (!plan || (plan !== "pro_monthly" && plan !== "pro_lifetime")) {
      return NextResponse.json(
        { error: "Could not determine plan from session" },
        { status: 400 },
      );
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id ?? null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        stripeSubscriptionId: plan === "pro_lifetime" ? null : subscriptionId,
      },
    });

    return NextResponse.json({ ok: true, plan: updated.plan });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to sync checkout session" },
      { status: 500 },
    );
  }
}
