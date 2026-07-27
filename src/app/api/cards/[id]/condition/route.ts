import { NextRequest, NextResponse } from "next/server";
import { calculateGrade } from "@/lib/condition";
import { getDemoUserId } from "@/lib/demo-user";
import { prisma } from "@/lib/prisma";
import { conditionSchema } from "@/lib/validators";

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
    const parsed = conditionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const grade = calculateGrade(parsed.data);
    const condition = await prisma.condition.create({
      data: {
        cardId: id,
        centering: parsed.data.centering,
        corners: parsed.data.corners,
        edges: parsed.data.edges,
        surface: parsed.data.surface,
        notes: parsed.data.notes || null,
        grade,
      },
    });

    return NextResponse.json({ condition }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save condition" },
      { status: 500 },
    );
  }
}
