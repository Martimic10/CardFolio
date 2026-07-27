import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isCardScanConfigured, scanCardImage } from "@/lib/card-scan";

const bodySchema = z.object({
  imageUrl: z.string().url(),
});

export async function GET() {
  return NextResponse.json({
    configured: isCardScanConfigured(),
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!isCardScanConfigured()) {
      return NextResponse.json(
        {
          error:
            "Card scanning is not configured. Add OPENAI_API_KEY to enable auto-ID.",
        },
        { status: 503 },
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 },
      );
    }

    const scan = await scanCardImage(parsed.data.imageUrl);
    return NextResponse.json({ scan });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Failed to scan card";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
