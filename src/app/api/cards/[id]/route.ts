import { NextRequest, NextResponse } from "next/server";
import { getDemoUserId } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { updateCardSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

async function getOwnedCard(id: string) {
  const userId = await getDemoUserId();
  return prisma.card.findFirst({
    where: { id, userId },
    include: {
      images: { orderBy: { createdAt: "asc" } },
      conditions: { orderBy: { createdAt: "desc" } },
      prices: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const card = await getOwnedCard(id);
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ card });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load card" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await getOwnedCard(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const card = await prisma.card.update({
      where: { id },
      data: {
        ...(data.player != null ? { player: data.player } : {}),
        ...(data.sport != null ? { sport: data.sport } : {}),
        ...(data.year != null ? { year: data.year } : {}),
        ...(data.setName != null ? { setName: data.setName } : {}),
        ...(data.cardNumber !== undefined
          ? { cardNumber: data.cardNumber || null }
          : {}),
        ...(data.variant !== undefined ? { variant: data.variant || null } : {}),
        ...(data.quantity != null ? { quantity: data.quantity } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
      },
      include: {
        images: { orderBy: { createdAt: "asc" } },
        conditions: { orderBy: { createdAt: "desc" } },
        prices: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await getOwnedCard(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await prisma.card.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 },
    );
  }
}
