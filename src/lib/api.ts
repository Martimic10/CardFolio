import type { CardListItem } from "@/lib/validators";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchCards(params: URLSearchParams) {
  const data = await parseJson<{ cards: CardListItem[] }>(
    await fetch(`/api/cards?${params.toString()}`),
  );
  return data.cards;
}

export async function fetchSummary() {
  return parseJson<{
    totalCards: number;
    totalValue: number;
    uniqueCards: number;
  }>(await fetch("/api/cards/summary"));
}

export async function fetchCard(id: string) {
  const data = await parseJson<{ card: CardDetail }>(
    await fetch(`/api/cards/${id}`),
  );
  return data.card;
}

export async function createCard(body: unknown) {
  return parseJson<{ card: CardListItem }>(
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function updateCard(id: string, body: unknown) {
  return parseJson<{ card: CardDetail }>(
    await fetch(`/api/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function deleteCard(id: string) {
  return parseJson<{ ok: boolean }>(
    await fetch(`/api/cards/${id}`, { method: "DELETE" }),
  );
}

export async function saveCondition(id: string, body: unknown) {
  return parseJson<{ condition: ConditionRecord }>(
    await fetch(`/api/cards/${id}/condition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function savePrice(id: string, body: unknown) {
  return parseJson<{ price: PriceRecord }>(
    await fetch(`/api/cards/${id}/price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function uploadFiles(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return parseJson<{ urls: string[] }>(
    await fetch("/api/upload", { method: "POST", body: form }),
  );
}

export type ScannedCard = {
  player: string;
  sport: string;
  year: number | null;
  setName: string;
  cardNumber: string | null;
  variant: string | null;
  brand: string | null;
  confidence: number;
};

export async function fetchScanStatus() {
  return parseJson<{ configured: boolean }>(await fetch("/api/cards/scan"));
}

export async function scanCardImage(imageUrl: string) {
  const data = await parseJson<{ scan: ScannedCard }>(
    await fetch("/api/cards/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    }),
  );
  return data.scan;
}

export type ConditionRecord = {
  id: string;
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  grade: number;
  notes: string | null;
  createdAt: string;
};

export type PriceRecord = {
  id: string;
  amount: number;
  source: string;
  notes: string | null;
  createdAt: string;
};

export type CardDetail = {
  id: string;
  player: string;
  sport: string;
  year: number;
  brand: string | null;
  setName: string;
  cardNumber: string | null;
  variant: string | null;
  quantity: number;
  notes: string | null;
  images: { id: string; url: string; side: string }[];
  conditions: ConditionRecord[];
  prices: PriceRecord[];
};
