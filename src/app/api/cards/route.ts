import { NextRequest, NextResponse } from "next/server";
import { calculateGrade } from "@/lib/condition";
import { getDemoUserId } from "@/lib/demo-user";
import { estimatePrice } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { createCardSchema } from "@/lib/validators";

function mapCard(card: {
  id: string;
  player: string;
  sport: string;
  year: number;
  brand: string | null;
  setName: string;
  cardNumber: string | null;
  variant: string | null;
  quantity: number;
  createdAt: Date;
  images: { url: string; side: string }[];
  conditions: { grade: number }[];
  prices: { amount: number }[];
}) {
  const front =
    card.images.find((i) => i.side === "front") ?? card.images[0] ?? null;
  return {
    id: card.id,
    player: card.player,
    sport: card.sport,
    year: card.year,
    brand: card.brand,
    setName: card.setName,
    cardNumber: card.cardNumber,
    variant: card.variant,
    quantity: card.quantity,
    thumbnailUrl: front?.url ?? null,
    grade: card.conditions[0]?.grade ?? null,
    estimatedValue: card.prices[0]?.amount ?? null,
    createdAt: card.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";
    const sport = searchParams.get("sport") ?? "";
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const minValue = searchParams.get("minValue");
    const maxValue = searchParams.get("maxValue");
    const minGrade = searchParams.get("minGrade");

    const cards = await prisma.card.findMany({
      where: {
        userId,
        ...(sport ? { sport } : {}),
        ...(q
          ? {
              OR: [
                { player: { contains: q, mode: "insensitive" } },
                { setName: { contains: q, mode: "insensitive" } },
                { brand: { contains: q, mode: "insensitive" } },
                { cardNumber: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        images: { orderBy: { createdAt: "asc" } },
        conditions: { orderBy: { createdAt: "desc" }, take: 1 },
        prices: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    let mapped = cards.map(mapCard);

    if (minValue) {
      const min = Number(minValue);
      mapped = mapped.filter(
        (c) => c.estimatedValue != null && c.estimatedValue >= min,
      );
    }
    if (maxValue) {
      const max = Number(maxValue);
      mapped = mapped.filter(
        (c) => c.estimatedValue != null && c.estimatedValue <= max,
      );
    }
    if (minGrade) {
      const min = Number(minGrade);
      mapped = mapped.filter((c) => c.grade != null && c.grade >= min);
    }

    mapped.sort((a, b) => {
      const dir = order === "asc" ? 1 : -1;
      switch (sort) {
        case "player":
          return a.player.localeCompare(b.player) * dir;
        case "year":
          return (a.year - b.year) * dir;
        case "grade":
          return ((a.grade ?? -1) - (b.grade ?? -1)) * dir;
        case "value":
          return ((a.estimatedValue ?? -1) - (b.estimatedValue ?? -1)) * dir;
        case "setName":
          return a.setName.localeCompare(b.setName) * dir;
        default:
          return (
            (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
            dir
          );
      }
    });

    return NextResponse.json({ cards: mapped });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load cards" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await request.json();
    const parsed = createCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const grade = data.condition
      ? calculateGrade(data.condition)
      : null;
    const price = estimatePrice({
      year: data.year,
      sport: data.sport,
      grade,
      startingPrice: data.startingPrice,
    });

    const card = await prisma.card.create({
      data: {
        userId,
        player: data.player,
        sport: data.sport,
        year: data.year,
        brand: data.brand || null,
        setName: data.setName,
        cardNumber: data.cardNumber || null,
        variant: data.variant || null,
        quantity: data.quantity,
        notes: data.notes || null,
        images: data.imageUrls?.length
          ? {
              create: data.imageUrls.map((url, i) => ({
                url,
                side: i === 0 ? "front" : "back",
              })),
            }
          : undefined,
        conditions: data.condition
          ? {
              create: {
                ...data.condition,
                grade: grade!,
              },
            }
          : undefined,
        prices: {
          create: {
            amount: price,
            source: data.startingPrice ? "manual" : "estimate",
          },
        },
      },
      include: {
        images: true,
        conditions: { orderBy: { createdAt: "desc" }, take: 1 },
        prices: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ card: mapCard(card) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 },
    );
  }
}
