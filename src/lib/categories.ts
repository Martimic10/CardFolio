/** Category values stored in Card.sport (kept for schema compatibility). */
export const CARD_CATEGORIES = [
  "Baseball",
  "Basketball",
  "Football",
  "Hockey",
  "Soccer",
  "Pokémon",
  "Magic: The Gathering",
  "Yu-Gi-Oh!",
  "Lorcana",
  "One Piece",
  "Other TCG",
  "Other",
] as const;

export type CardCategory = (typeof CARD_CATEGORIES)[number];

export const CATEGORY_FILTER_OPTIONS = [
  "",
  ...CARD_CATEGORIES,
] as const;

export function categoryShortCode(category: string): string {
  const map: Record<string, string> = {
    Baseball: "BB",
    Basketball: "BK",
    Football: "FB",
    Hockey: "HK",
    Soccer: "SC",
    Pokémon: "PKM",
    "Magic: The Gathering": "MTG",
    "Yu-Gi-Oh!": "YGO",
    Lorcana: "LOR",
    "One Piece": "OP",
    "Other TCG": "TCG",
    Other: "OTH",
  };
  return map[category] ?? category.slice(0, 3).toUpperCase();
}
