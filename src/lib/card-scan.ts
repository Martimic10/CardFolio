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

const KNOWN_BRANDS = [
  "Topps",
  "Score",
  "Panini",
  "Upper Deck",
  "Donruss",
  "Fleer",
  "Bowman",
  "Leaf",
  "O-Pee-Chee",
  "Pinnacle",
  "SkyBox",
  "Stadium Club",
  "Select",
  "Prizm",
  "Optic",
  "Mosaic",
  "Chronicles",
  "Hoops",
  "Certified",
  "Prestige",
  "Playoff",
  "Contenders",
  "The Pokémon Company",
  "Wizards of the Coast",
  "Konami",
  "Ravensburger",
  "Bandai",
  "Bushiroad",
] as const;

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

function normalizeBrand(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  for (const brand of KNOWN_BRANDS) {
    if (brand.toLowerCase() === lower) return brand;
  }

  const aliases: Record<string, string> = {
    topps: "Topps",
    "topps chrome": "Topps",
    "topps update": "Topps",
    score: "Score",
    panini: "Panini",
    "upper deck": "Upper Deck",
    ud: "Upper Deck",
    donruss: "Donruss",
    fleer: "Fleer",
    bowman: "Bowman",
    prizm: "Prizm",
    optic: "Optic",
    mosaic: "Mosaic",
    pokemon: "The Pokémon Company",
    "pokémon": "The Pokémon Company",
    "the pokemon company": "The Pokémon Company",
    wizards: "Wizards of the Coast",
    wotc: "Wizards of the Coast",
    konami: "Konami",
    ravensburger: "Ravensburger",
    bandai: "Bandai",
  };

  return aliases[lower] ?? trimmed;
}

function parseYear(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const y = Math.round(raw);
    if (y >= 1869 && y <= 2100) return y;
  }
  if (typeof raw === "string") {
    const match = raw.match(/(19|20)\d{2}/);
    if (match) {
      const y = Number(match[0]);
      if (y >= 1869 && y <= 2100) return y;
    }
  }
  return null;
}

export function isCardScanConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/**
 * Vision scan: name, brand (Topps/Score/etc.), year, set, card number.
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
  const brandsList = KNOWN_BRANDS.join(", ");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert sports-card and TCG cataloger. Read the PHOTO carefully (front text, logos, copyright line, set badge, card number).

Return ONLY valid JSON with:
- player: string — the main player or character name printed largest on the card
- sport: string — MUST be one of: ${categoriesList}
- year: number or null — the CARD YEAR. Prefer copyright year (© 1989), then set year printed on the card. Always a 4-digit year when visible. Never invent a year.
- brand: string or null — the MANUFACTURER / company brand ONLY (examples: ${brandsList}). For sports this is Topps, Score, Panini, Upper Deck, Donruss, Fleer, Bowman, etc. For TCG: The Pokémon Company, Wizards of the Coast, Konami, Ravensburger, Bandai. Do NOT put the product line here.
- setName: string — the product line / set title SEPARATE from brand (e.g. "Series 1", "Chrome", "Update", "Prizm", "Base Set", "Evolving Skies", "Legend of Blue Eyes"). If brand and set are the same word historically (e.g. Upper Deck set), still put manufacturer in brand and the set title in setName.
- cardNumber: string or null — collector number exactly as printed (#1, 57, 4/102, US1, LOB-001)
- variant: string or null — holo, refractor, 1st Edition, parallel, insert, etc. if clear
- confidence: number 0–1

Critical rules:
1. brand and setName are DIFFERENT fields. "2023 Topps Chrome" → brand "Topps", setName "Chrome" (or "Topps Chrome" only in setName if needed), year 2023.
2. Always try hard to find YEAR from © line, small print, or set branding.
3. Always try hard to find BRAND from logo / wordmark (Topps script, Score, Panini shield, UD, etc.).
4. If text is blurry, still give your best read and lower confidence.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract player/character name, brand (Topps/Score/Panini/etc.), year, set name, and card number from this card photo.",
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

  const brand = normalizeBrand(
    typeof parsed.brand === "string" ? parsed.brand : null,
  );
  const setFromScan =
    typeof parsed.setName === "string" && parsed.setName.trim()
      ? parsed.setName.trim()
      : null;

  const confidenceRaw = parsed.confidence;
  const confidence =
    typeof confidenceRaw === "number" && Number.isFinite(confidenceRaw)
      ? Math.min(1, Math.max(0, confidenceRaw))
      : 0.5;

  return {
    player:
      typeof parsed.player === "string" && parsed.player.trim()
        ? parsed.player.trim()
        : "Untitled card",
    sport: normalizeCategory(
      typeof parsed.sport === "string" ? parsed.sport : null,
    ),
    year: parseYear(parsed.year),
    setName: setFromScan || brand || "Unsorted",
    cardNumber:
      typeof parsed.cardNumber === "string" && parsed.cardNumber.trim()
        ? parsed.cardNumber.trim()
        : null,
    variant:
      typeof parsed.variant === "string" && parsed.variant.trim()
        ? parsed.variant.trim()
        : null,
    brand,
    confidence,
  };
}
