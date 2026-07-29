import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isBillingMockMode, planFromPriceId } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (isBillingMockMode()) {
    return NextResponse.json(
      { error: "Stripe webhooks require BILLING_MOCK=false and STRIPE_WEBHOOK_SECRET." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook not configured. Set STRIPE_WEBHOOK_SECRET (from `stripe listen` or the Dashboard).",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.userId ?? session.client_reference_id ?? undefined;
        let plan = session.metadata?.plan as string | undefined;

        if (!plan && session.mode === "subscription") {
          plan = "pro_monthly";
        }
        if (!plan && session.mode === "payment") {
          plan = "pro_lifetime";
        }

        if (userId && plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeCustomerId:
                typeof session.customer === "string"
                  ? session.customer
                  : undefined,
              stripeSubscriptionId:
                typeof session.subscription === "string"
                  ? session.subscription
                  : plan === "pro_lifetime"
                    ? null
                    : undefined,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (!user) break;

        if (
          event.type === "customer.subscription.deleted" ||
          sub.status === "canceled" ||
          sub.status === "unpaid" ||
          sub.status === "incomplete_expired"
        ) {
          if (user.plan !== "pro_lifetime") {
            await prisma.user.update({
              where: { id: user.id },
              data: { plan: "free", stripeSubscriptionId: null },
            });
          }
        } else if (sub.status === "active" || sub.status === "trialing") {
          const priceId = sub.items.data[0]?.price.id;
          const plan =
            (priceId && planFromPriceId(priceId)) ||
            (sub.metadata?.plan as string | undefined) ||
            "pro_monthly";
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              stripeSubscriptionId: sub.id,
            },
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (user && user.plan === "pro_monthly") {
          await prisma.user.update({
            where: { id: user.id },
            data: { plan: "free", stripeSubscriptionId: null },
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
