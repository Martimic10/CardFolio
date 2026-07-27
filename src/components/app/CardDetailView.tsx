"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCard,
  fetchCard,
  saveCondition,
  savePrice,
  updateCard,
} from "@/lib/api";
import { calculateGrade, gradeLabel } from "@/lib/condition";
import { formatCurrency } from "@/lib/pricing";

export function CardDetailView({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cardQuery = useQuery({
    queryKey: ["card", id],
    queryFn: () => fetchCard(id),
  });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    player: "",
    sport: "",
    year: "",
    setName: "",
    cardNumber: "",
    variant: "",
    quantity: "1",
    notes: "",
  });
  const [scores, setScores] = useState({
    centering: 8,
    corners: 8,
    edges: 8,
    surface: 8,
  });
  const [priceAmount, setPriceAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!cardQuery.data) return;
    const c = cardQuery.data;
    setForm({
      player: c.player,
      sport: c.sport,
      year: String(c.year),
      setName: c.setName,
      cardNumber: c.cardNumber ?? "",
      variant: c.variant ?? "",
      quantity: String(c.quantity),
      notes: c.notes ?? "",
    });
    const latest = c.conditions[0];
    if (latest) {
      setScores({
        centering: latest.centering,
        corners: latest.corners,
        edges: latest.edges,
        surface: latest.surface,
      });
    }
  }, [cardQuery.data]);

  const liveGrade = calculateGrade(scores);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCard(id, {
        player: form.player,
        sport: form.sport,
        year: Number(form.year),
        setName: form.setName,
        cardNumber: form.cardNumber || null,
        variant: form.variant || null,
        quantity: Number(form.quantity) || 1,
        notes: form.notes || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card", id] });
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      setEditing(false);
      setMessage("Details saved.");
    },
  });

  const conditionMutation = useMutation({
    mutationFn: () => saveCondition(id, scores),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card", id] });
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      setMessage("Condition recorded.");
    },
  });

  const priceMutation = useMutation({
    mutationFn: () =>
      savePrice(id, { amount: Number(priceAmount), source: "manual" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["card", id] });
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      await queryClient.invalidateQueries({ queryKey: ["summary"] });
      setPriceAmount("");
      setMessage("Price update added.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCard(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      await queryClient.invalidateQueries({ queryKey: ["summary"] });
      router.push("/app");
    },
  });

  if (cardQuery.isLoading) {
    return (
      <div className="cf-panel px-6 py-16 text-center font-body text-sm text-charcoal">
        Loading card…
      </div>
    );
  }

  if (cardQuery.isError || !cardQuery.data) {
    return (
      <div className="border-2 border-stamp bg-paper px-6 py-4 font-body text-sm text-stamp">
        Card not found.{" "}
        <Link href="/app" className="underline">
          Back to collection
        </Link>
      </div>
    );
  }

  const card = cardQuery.data;
  const currentPrice = card.prices[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/app"
            className="font-body text-sm text-charcoal no-underline hover:text-ink"
          >
            ← Collection
          </Link>
          <p className="cf-label mt-4 mb-2">Catalog record</p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">{card.player}</h1>
          <p className="mt-2 font-body text-sm text-charcoal">
            {card.year} · {card.setName}
            {card.cardNumber ? ` #${card.cardNumber}` : ""}
            {card.variant ? ` · ${card.variant}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="cf-btn w-full sm:w-auto"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this card?")) deleteMutation.mutate();
            }}
            className="cf-btn w-full border-stamp text-stamp hover:bg-stamp hover:text-paper sm:w-auto"
          >
            Delete
          </button>
        </div>
      </div>

      {message && (
        <p className="cf-panel border-sage px-3 py-2 font-body text-sm text-sage">
          {message}
        </p>
      )}

      <div className="grid gap-5 sm:gap-6 lg:grid-cols-[220px_1fr]">
        <div className="mx-auto w-full max-w-[240px] space-y-3 lg:mx-0 lg:max-w-none">
          {card.images.length === 0 && (
            <div className="flex aspect-[2.5/3.5] items-center justify-center border-2 border-dashed border-manila bg-paper font-mono text-xs tracking-wider text-sage">
              NO PHOTO
            </div>
          )}
          {card.images.map((img) => (
            <div key={img.id} className="cf-panel overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.side} className="w-full object-cover" />
              <p className="cf-label border-t border-ink/20 px-3 py-1.5">
                {img.side}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-4 sm:space-y-5">
          <section className="cf-panel p-4 sm:p-5">
            <h2 className="mb-4 font-display text-lg text-ink">Details</h2>
            {editing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["player", "Name"],
                    ["sport", "Category"],
                    ["year", "Year"],
                    ["setName", "Set"],
                    ["cardNumber", "Card #"],
                    ["variant", "Variant"],
                    ["quantity", "Qty"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="cf-label">{label}</span>
                    <input
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      className="cf-input"
                    />
                  </label>
                ))}
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="cf-label">Notes</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={3}
                    className="cf-input"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate()}
                    className="cf-btn cf-btn-primary"
                  >
                    {updateMutation.isPending ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Category", card.sport],
                  ["Year", String(card.year)],
                  ["Set", card.setName],
                  ["Card #", card.cardNumber || "—"],
                  ["Variant", card.variant || "—"],
                  ["Quantity", String(card.quantity)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-b border-dotted border-manila pb-2"
                  >
                    <dt className="cf-label">{label}</dt>
                    <dd className="mt-1 font-body text-sm text-ink">{value}</dd>
                  </div>
                ))}
                {card.notes && (
                  <div className="sm:col-span-2">
                    <dt className="cf-label">Notes</dt>
                    <dd className="mt-1 font-body text-sm text-ink">
                      {card.notes}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </section>

          <section className="cf-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Condition</h2>
              <p className="font-mono text-sm">
                <span className="font-medium text-stamp">
                  {liveGrade.toFixed(1)}
                </span>{" "}
                <span className="text-sage">{gradeLabel(liveGrade)}</span>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["centering", "Centering"],
                  ["corners", "Corners"],
                  ["edges", "Edges"],
                  ["surface", "Surface"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex flex-col gap-2">
                  <span className="flex justify-between">
                    <span className="cf-label">{label}</span>
                    <span className="font-mono text-sm text-ink">
                      {scores[key]}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={scores[key]}
                    onChange={(e) =>
                      setScores((s) => ({
                        ...s,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="accent-stamp"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={conditionMutation.isPending}
              onClick={() => conditionMutation.mutate()}
              className="cf-btn mt-4"
            >
              {conditionMutation.isPending ? "Saving…" : "Save condition"}
            </button>
          </section>

          <section className="cf-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-ink">Price</h2>
              <p className="font-mono text-xl font-medium text-stamp">
                {currentPrice ? formatCurrency(currentPrice.amount) : "—"}
              </p>
            </div>

            <form
              className="mb-5 flex flex-wrap items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!priceAmount) return;
                priceMutation.mutate();
              }}
            >
              <label className="flex flex-col gap-1">
                <span className="cf-label">Add price update</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="0.00"
                  className="cf-input w-40 font-mono"
                />
              </label>
              <button
                type="submit"
                disabled={priceMutation.isPending || !priceAmount}
                className="cf-btn cf-btn-primary"
              >
                {priceMutation.isPending ? "Saving…" : "Add update"}
              </button>
            </form>

            <h3 className="cf-label mb-2">History</h3>
            {card.prices.length === 0 ? (
              <p className="font-body text-sm text-charcoal">
                No price entries yet.
              </p>
            ) : (
              <div className="overflow-hidden border border-ink/25">
                <table className="w-full text-left font-body text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="px-3 py-2">
                        <span className="cf-label">Date</span>
                      </th>
                      <th className="px-3 py-2">
                        <span className="cf-label">Amount</span>
                      </th>
                      <th className="px-3 py-2">
                        <span className="cf-label">Source</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.prices.map((p) => (
                      <tr key={p.id} className="border-t border-ink/15">
                        <td className="px-3 py-2 text-charcoal">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 font-mono font-medium text-stamp">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-sage">
                          {p.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
