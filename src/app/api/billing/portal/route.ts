import { NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { appUrl, getStripe, isBillingMockMode, stripeConfigured } from "@/lib/billing";

export async function POST() {
  try {
    const user = await getAppUser();

    if (isBillingMockMode() || !stripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add Stripe keys and set BILLING_MOCK=false.",
        },
        { status: 503 },
      );
    }

    if (!user.stripeCustomerId || user.stripeCustomerId.startsWith("mock_cus_")) {
      return NextResponse.json(
        { error: "No Stripe customer on file. Upgrade once to create a billing profile." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl()}/app/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 },
    );
  }
}
