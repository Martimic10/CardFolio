import { NextResponse } from "next/server";
import { UnauthorizedError, getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAppUser();
    const cards = await prisma.card.findMany({
      where: { userId: user.id },
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
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load summary" },
      { status: 500 },
    );
  }
}
