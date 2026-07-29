import { NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { buildMarketInsights } from "@/lib/market-insights";
import { hasProAccess } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAppUser();
    if (!hasProAccess(user)) {
      return NextResponse.json(
        {
          error: "Market insights require Pro.",
          code: "PRO_REQUIRED",
        },
        { status: 403 },
      );
    }

    const cards = await prisma.card.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        player: true,
        sport: true,
        setName: true,
        quantity: true,
        prices: {
          orderBy: { createdAt: "desc" },
          select: { amount: true, createdAt: true },
        },
      },
    });

    const insights = buildMarketInsights(cards);

    return NextResponse.json({
      insights: {
        ...insights,
        topMover: insights.topMover,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load market insights" },
      { status: 500 },
    );
  }
}
