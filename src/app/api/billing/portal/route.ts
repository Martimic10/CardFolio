import { NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { appUrl, getStripe, isBillingMockMode } from "@/lib/billing";

export async function POST() {
  try {
    const user = await getAppUser();

    if (isBillingMockMode()) {
      return NextResponse.json({
        mock: true,
        message:
          "Billing is in mock mode. Use the account page to change plans without Stripe.",
        url: `${appUrl()}/app/account`,
      });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer on file" },
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
