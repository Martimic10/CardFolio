import { NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { FREE_CARD_LIMIT, hasProAccess, planLabel } from "@/lib/plans";
import { isBillingMockMode } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAppUser();
    const uniqueCards = await prisma.card.count({ where: { userId: user.id } });
    const pro = hasProAccess(user);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      planLabel: planLabel(user.plan),
      hasProAccess: pro,
      uniqueCards,
      cardLimit: pro ? null : FREE_CARD_LIMIT,
      cardsRemaining: pro ? null : Math.max(0, FREE_CARD_LIMIT - uniqueCards),
      billingMock: isBillingMockMode(),
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to load account" }, { status: 500 });
  }
}
