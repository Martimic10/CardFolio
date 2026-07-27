import { CARD_CATEGORIES, type CardCategory } from "@/lib/categories";

export type ScannedCardFields = {
  player: string;
  sport: CardCategory;
  year: number | null;
  setName: string;
  cardNumber: string | null;
  variant: string | null;
  brand: string | null;
  confidence: number;
};

const CATEGORY_SET = new Set<string>(CARD_CATEGORIES);

function normalizeCategory(raw: string | null | undefined): CardCategory {
  if (!raw) return "Other";
  const trimmed = raw.trim();
  if (CATEGORY_SET.has(trimmed)) return trimmed as CardCategory;

  const lower = trimmed.toLowerCase();
  const aliases: Record<string, CardCategory> = {
    pokemon: "Pokémon",
    "pokémon": "Pokémon",
    pkm: "Pokémon",
    mtg: "Magic: The Gathering",
    magic: "Magic: The Gathering",
    "magic the gathering": "Magic: The Gathering",
    yugioh: "Yu-Gi-Oh!",
    "yu-gi-oh": "Yu-Gi-Oh!",
    "yu gi oh": "Yu-Gi-Oh!",
    lorcana: "Lorcana",
    "one piece": "One Piece",
    baseball: "Baseball",
    basketball: "Basketball",
    football: "Football",
    nfl: "Football",
    nba: "Basketball",
    mlb: "Baseball",
    nhl: "Hockey",
    hockey: "Hockey",
    soccer: "Soccer",
    tcg: "Other TCG",
  };

  return aliases[lower] ?? "Other";
}

export function isCardScanConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Vision scan: identify player/character, category, year, set/brand, card number.
 */
export async function scanCardImage(
  imageUrl: string,
): Promise<ScannedCardFields> {
  if (!isCardScanConfigured()) {
    throw new Error(
      "Card scanning needs OPENAI_API_KEY. Add it to .env and Vercel.",
    );
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const categoriesList = CARD_CATEGORIES.join(", ");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You identify trading cards (sports and TCG) from photos.
Return ONLY valid JSON with these keys:
- player: string (player or character name)
- sport: string (must be one of: ${categoriesList})
- year: number or null (copyright / set year on the card)
- setName: string (set name, e.g. "Base Set", "Upper Deck", "Evolving Skies")
- brand: string or null (manufacturer brand if visible, e.g. Topps, Panini, Wizards, Pokémon Company)
- cardNumber: string or null (collector number like "4/102" or "#57")
- variant: string or null (holo, 1st edition, refractor, parallel, etc. if clear)
- confidence: number from 0 to 1

If unsure, use null for optional fields and a best-guess player name.
Prefer the most prominent name printed on the card.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify this trading card and extract the fields.",
          },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Scan returned an empty response.");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Scan returned invalid JSON.");
  }

  const yearRaw = parsed.year;
  let year: number | null = null;
  if (typeof yearRaw === "number" && Number.isFinite(yearRaw)) {
    year = Math.round(yearRaw);
  } else if (typeof yearRaw === "string" && yearRaw.trim()) {
    const n = Number(yearRaw);
    if (Number.isFinite(n)) year = Math.round(n);
  }

  const confidenceRaw = parsed.confidence;
  const confidence =
    typeof confidenceRaw === "number" && Number.isFinite(confidenceRaw)
      ? Math.min(1, Math.max(0, confidenceRaw))
      : 0.5;

  const setName =
    (typeof parsed.setName === "string" && parsed.setName.trim()) ||
    (typeof parsed.brand === "string" && parsed.brand.trim()) ||
    "Unsorted";

  return {
    player:
      typeof parsed.player === "string" && parsed.player.trim()
        ? parsed.player.trim()
        : "Untitled card",
    sport: normalizeCategory(
      typeof parsed.sport === "string" ? parsed.sport : null,
    ),
    year,
    setName,
    cardNumber:
      typeof parsed.cardNumber === "string" && parsed.cardNumber.trim()
        ? parsed.cardNumber.trim()
        : null,
    variant:
      typeof parsed.variant === "string" && parsed.variant.trim()
        ? parsed.variant.trim()
        : null,
    brand:
      typeof parsed.brand === "string" && parsed.brand.trim()
        ? parsed.brand.trim()
        : null,
    confidence,
  };
}
