import { z } from "zod";

export const createCardSchema = z.object({
  player: z.string().min(1),
  sport: z.string().min(1),
  year: z.coerce.number().int().min(1869).max(2100),
  brand: z.string().optional().nullable(),
  setName: z.string().min(1),
  cardNumber: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional().nullable(),
  startingPrice: z.coerce.number().optional().nullable(),
  imageUrls: z.array(z.string()).optional().default([]),
  condition: z
    .object({
      centering: z.coerce.number().min(1).max(10),
      corners: z.coerce.number().min(1).max(10),
      edges: z.coerce.number().min(1).max(10),
      surface: z.coerce.number().min(1).max(10),
    })
    .optional()
    .nullable(),
});

export const updateCardSchema = createCardSchema.partial();

export const conditionSchema = z.object({
  centering: z.coerce.number().min(1).max(10),
  corners: z.coerce.number().min(1).max(10),
  edges: z.coerce.number().min(1).max(10),
  surface: z.coerce.number().min(1).max(10),
  notes: z.string().optional().nullable(),
});

export const priceSchema = z.object({
  amount: z.coerce.number().positive(),
  source: z.string().optional().default("manual"),
  notes: z.string().optional().nullable(),
});

export type CardListItem = {
  id: string;
  player: string;
  sport: string;
  year: number;
  brand: string | null;
  setName: string;
  cardNumber: string | null;
  variant: string | null;
  quantity: number;
  thumbnailUrl: string | null;
  grade: number | null;
  estimatedValue: number | null;
  createdAt: string;
};
