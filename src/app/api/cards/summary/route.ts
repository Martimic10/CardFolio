import { NextResponse } from "next/server";
import { getDemoUserId } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await getDemoUserId();
    const cards = await prisma.card.findMany({
      where: { userId },
      include: {
        prices: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);
    const totalValue = cards.reduce(
      (sum, c) => sum + (c.prices[0]?.amount ?? 0) * c.quantity,
      0,
    );

    return NextResponse.json({
      totalCards,
      totalValue: Math.round(totalValue * 100) / 100,
      uniqueCards: cards.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 },
    );
  }
}
