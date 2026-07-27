import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { priceSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = await getDemoUserId();
    const card = await prisma.card.findFirst({ where: { id, userId } });
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = priceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const price = await prisma.priceEntry.create({
      data: {
        cardId: id,
        amount: parsed.data.amount,
        source: parsed.data.source || "manual",
        notes: parsed.data.notes || null,
      },
    });

    return NextResponse.json({ price }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save price" },
      { status: 500 },
    );
  }
}
