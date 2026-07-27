"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCard, uploadFiles } from "@/lib/api";
import { CARD_CATEGORIES } from "@/lib/categories";
import { calculateGrade } from "@/lib/condition";

const emptyForm = {
  player: "",
  sport: "Pokémon",
  year: new Date().getFullYear().toString(),
  setName: "",
  cardNumber: "",
  variant: "",
  quantity: "1",
  startingPrice: "",
  centering: "8",
  corners: "8",
  edges: "8",
  surface: "8",
};

export function AddCardForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const grade = calculateGrade({
    centering: Number(form.centering),
    corners: Number(form.corners),
    edges: Number(form.edges),
    surface: Number(form.surface),
  });

  const mutation = useMutation({
    mutationFn: async (stayOpen: boolean) => {
      setError(null);
      let imageUrls: string[] = [];
      if (files.length) {
        const uploaded = await uploadFiles(files);
        imageUrls = uploaded.urls;
      }
      const result = await createCard({
        player: form.player,
        sport: form.sport,
        year: Number(form.year),
        setName: form.setName,
        cardNumber: form.cardNumber || null,
        variant: form.variant || null,
        quantity: Number(form.quantity) || 1,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        imageUrls,
        condition: {
          centering: Number(form.centering),
          corners: Number(form.corners),
          edges: Number(form.edges),
          surface: Number(form.surface),
        },
      });
      return { result, stayOpen };
    },
    onSuccess: async ({ result, stayOpen }) => {
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      await queryClient.invalidateQueries({ queryKey: ["summary"] });
      if (stayOpen) {
        setForm(emptyForm);
        setFiles([]);
      } else {
        router.push(`/app/cards/${result.card.id}`);
      }
    },
    onError: (err: Error) => setError(err.message),
  });

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app"
          className="font-body text-sm text-charcoal no-underline hover:text-ink"
        >
          ← Collection
        </Link>
        <p className="cf-label mt-4 mb-2">New record</p>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Add card</h1>
        <p className="mt-2 font-body text-sm text-charcoal">
          Sports or TCG — upload photos and enter details. Use Save & add
          another when logging a stack.
        </p>
      </div>

      <form
        className="space-y-4 sm:space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(false);
        }}
      >
        <section className="cf-panel p-4 sm:p-5">
          <h2 className="font-display text-lg text-ink">Photos</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`mt-3 border border-dashed px-4 py-8 text-center sm:py-10 ${
              dragOver
                ? "border-stamp bg-stamp/5"
                : "border-manila bg-cream"
            }`}
          >
            <p className="font-body text-sm text-charcoal">
              Take or choose photos —{" "}
              <label className="cursor-pointer font-medium text-stamp underline">
                browse library
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>
            </p>
            {files.length > 0 && (
              <ul className="mt-4 space-y-1 text-left font-mono text-xs text-ink">
                {files.map((f) => (
                  <li key={f.name + f.size} className="truncate">
                    {f.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="cf-panel p-5">
          <h2 className="mb-4 font-display text-lg text-ink">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name / player" required>
              <input
                required
                value={form.player}
                onChange={(e) => update("player", e.target.value)}
                placeholder="Player or character name"
                className="cf-input"
              />
            </Field>
            <Field label="Category">
              <select
                value={form.sport}
                onChange={(e) => update("sport", e.target.value)}
                className="cf-input"
              >
                {CARD_CATEGORIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Year" required>
              <input
                required
                type="number"
                value={form.year}
                onChange={(e) => update("year", e.target.value)}
                className="cf-input font-mono"
              />
            </Field>
            <Field label="Set name" required>
              <input
                required
                value={form.setName}
                onChange={(e) => update("setName", e.target.value)}
                className="cf-input"
              />
            </Field>
            <Field label="Card number">
              <input
                value={form.cardNumber}
                onChange={(e) => update("cardNumber", e.target.value)}
                className="cf-input font-mono"
              />
            </Field>
            <Field label="Variant">
              <input
                value={form.variant}
                onChange={(e) => update("variant", e.target.value)}
                className="cf-input"
              />
            </Field>
            <Field label="Quantity">
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className="cf-input font-mono"
              />
            </Field>
            <Field label="Starting price (optional)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.startingPrice}
                onChange={(e) => update("startingPrice", e.target.value)}
                className="cf-input font-mono"
              />
            </Field>
          </div>
        </section>

        <section className="cf-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Condition estimate</h2>
            <p className="font-mono text-sm text-stamp">
              Grade {grade.toFixed(1)}
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
                  <span className="font-mono text-sm text-ink">{form[key]}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={form[key]}
                  onChange={(e) => update(key, e.target.value)}
                  className="accent-stamp"
                />
              </label>
            ))}
          </div>
        </section>

        {error && (
          <p className="border-2 border-stamp bg-paper px-3 py-2 font-body text-sm text-stamp">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="cf-btn cf-btn-primary w-full sm:w-auto"
          >
            {mutation.isPending ? "Saving…" : "Save card"}
          </button>
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(true)}
            className="cf-btn w-full sm:w-auto"
          >
            Save & add another
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="cf-label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
