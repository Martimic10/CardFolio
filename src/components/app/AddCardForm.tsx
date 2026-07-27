"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCard,
  fetchScanStatus,
  scanCardImage,
  uploadFiles,
  type ScannedCard,
} from "@/lib/api";
import { CARD_CATEGORIES } from "@/lib/categories";
import { calculateGrade } from "@/lib/condition";

type Mode = "single" | "bulk";

const emptyForm = {
  player: "",
  sport: "Pokémon",
  year: new Date().getFullYear().toString(),
  brand: "",
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

function fileLabel(file: File) {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return base || "Untitled card";
}

function applyScanToForm(
  scan: ScannedCard,
  fallbacks: {
    sport: string;
    year: string;
    setName: string;
    brand: string;
  },
) {
  return {
    player: scan.player || "Untitled card",
    sport: scan.sport || fallbacks.sport,
    year: scan.year ? String(scan.year) : fallbacks.year,
    brand: scan.brand || fallbacks.brand,
    setName: scan.setName || fallbacks.setName || scan.brand || "Unsorted",
    cardNumber: scan.cardNumber || "",
    variant: scan.variant || "",
  };
}

export function AddCardForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("single");
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);
  const [scanNote, setScanNote] = useState<string | null>(null);

  const scanStatus = useQuery({
    queryKey: ["scan-status"],
    queryFn: fetchScanStatus,
  });
  const scanEnabled = scanStatus.data?.configured ?? false;

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const grade = calculateGrade({
    centering: Number(form.centering),
    corners: Number(form.corners),
    edges: Number(form.edges),
    surface: Number(form.surface),
  });

  const conditionPayload = {
    centering: Number(form.centering),
    corners: Number(form.corners),
    edges: Number(form.edges),
    surface: Number(form.surface),
  };

  const singleMutation = useMutation({
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
        brand: form.brand || null,
        setName: form.setName,
        cardNumber: form.cardNumber || null,
        variant: form.variant || null,
        quantity: Number(form.quantity) || 1,
        startingPrice: form.startingPrice ? Number(form.startingPrice) : null,
        imageUrls,
        condition: conditionPayload,
      });
      return { result, stayOpen };
    },
    onSuccess: async ({ result, stayOpen }) => {
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      await queryClient.invalidateQueries({ queryKey: ["summary"] });
      if (stayOpen) {
        setForm(emptyForm);
        setFiles([]);
        setScanNote(null);
      } else {
        router.push(`/app/cards/${result.card.id}`);
      }
    },
    onError: (err: Error) => setError(err.message),
  });

  const scanFirstPhotoMutation = useMutation({
    mutationFn: async () => {
      if (!files[0]) throw new Error("Add a photo first.");
      setScanNote(null);
      const uploaded = await uploadFiles([files[0]]);
      const imageUrl = uploaded.urls[0];
      if (!imageUrl) throw new Error("Upload failed.");
      const scan = await scanCardImage(imageUrl);
      return { scan, imageUrl, allUrls: uploaded.urls };
    },
    onSuccess: ({ scan }) => {
      const filled = applyScanToForm(scan, {
        sport: form.sport,
        year: form.year,
        setName: form.setName,
        brand: form.brand,
      });
      setForm((f) => ({
        ...f,
        ...filled,
      }));
      setScanNote(
        `Scanned · ${Math.round(scan.confidence * 100)}% confidence. Review fields before saving.`,
      );
    },
    onError: (err: Error) => setError(err.message),
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!files.length) {
        throw new Error("Select at least one photo.");
      }
      setError(null);
      const createdIds: string[] = [];
      const fallbacks = {
        sport: form.sport,
        year: form.year || String(new Date().getFullYear()),
        setName: form.setName || "Unsorted",
        brand: form.brand || "",
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBulkProgress(`Uploading ${i + 1} of ${files.length}…`);
        const uploaded = await uploadFiles([file]);
        const imageUrl = uploaded.urls[0];

        let fields = {
          player: fileLabel(file),
          sport: fallbacks.sport,
          year: Number(fallbacks.year) || new Date().getFullYear(),
          brand: fallbacks.brand || null as string | null,
          setName: fallbacks.setName,
          cardNumber: null as string | null,
          variant: null as string | null,
        };

        if (scanEnabled && imageUrl) {
          try {
            setBulkProgress(`Scanning ${i + 1} of ${files.length}…`);
            const scan = await scanCardImage(imageUrl);
            const filled = applyScanToForm(scan, fallbacks);
            fields = {
              player: filled.player,
              sport: filled.sport,
              year: Number(filled.year) || fields.year,
              brand: filled.brand || null,
              setName: filled.setName,
              cardNumber: filled.cardNumber || null,
              variant: filled.variant || null,
            };
          } catch (err) {
            console.warn("Scan failed, using fallbacks", err);
          }
        }

        setBulkProgress(`Saving card ${i + 1} of ${files.length}…`);
        const result = await createCard({
          player: fields.player,
          sport: fields.sport,
          year: fields.year,
          brand: fields.brand,
          setName: fields.setName,
          cardNumber: fields.cardNumber,
          variant: fields.variant,
          quantity: 1,
          startingPrice: form.startingPrice
            ? Number(form.startingPrice)
            : null,
          imageUrls: uploaded.urls,
          condition: conditionPayload,
        });
        createdIds.push(result.card.id);
      }

      return createdIds;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cards"] });
      await queryClient.invalidateQueries({ queryKey: ["summary"] });
      setBulkProgress(null);
      setFiles([]);
      router.push("/app/collection");
    },
    onError: (err: Error) => {
      setBulkProgress(null);
      setError(err.message);
    },
  });

  const pending =
    singleMutation.isPending ||
    bulkMutation.isPending ||
    scanFirstPhotoMutation.isPending;

  function update<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...next]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/app/collection"
          className="font-body text-sm text-charcoal no-underline hover:text-ink"
        >
          ← Collection
        </Link>
        <p className="cf-label mt-4 mb-2">New record</p>
        <h1 className="font-display text-2xl text-ink sm:text-3xl">Add cards</h1>
        <p className="mt-2 font-body text-sm text-charcoal">
          Add one card with full details, or bulk-import a stack. When scanning
          is on, each photo is auto-read for name, category, year, set, and
          number.
        </p>
      </div>

      <div
        className={`border-2 px-3 py-2 font-body text-sm ${
          scanEnabled
            ? "border-sage bg-paper text-sage"
            : "border-manila bg-paper text-charcoal"
        }`}
      >
        {scanStatus.isLoading
          ? "Checking scan status…"
          : scanEnabled
            ? "Auto-scan is on — bulk import will identify each card from its photo."
            : "Auto-scan is off. Add OPENAI_API_KEY to .env (and Vercel) to enable."}
      </div>

      <div className="flex border-2 border-ink">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`min-h-11 flex-1 px-3 py-2 font-body text-sm ${
            mode === "single" ? "bg-ink text-paper" : "bg-paper text-charcoal"
          }`}
        >
          Single card
        </button>
        <button
          type="button"
          onClick={() => setMode("bulk")}
          className={`min-h-11 flex-1 border-l-2 border-ink px-3 py-2 font-body text-sm ${
            mode === "bulk" ? "bg-ink text-paper" : "bg-paper text-charcoal"
          }`}
        >
          Bulk import
        </button>
      </div>

      <form
        className="space-y-4 sm:space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (mode === "bulk") {
            bulkMutation.mutate();
          } else {
            singleMutation.mutate(false);
          }
        }}
      >
        <section className="cf-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg text-ink">Photos</h2>
            {files.length > 0 && (
              <span className="font-mono text-xs text-sage">
                {files.length} selected
              </span>
            )}
          </div>

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
            className={`border border-dashed px-4 py-6 text-center sm:py-8 ${
              dragOver ? "border-stamp bg-stamp/5" : "border-manila bg-cream"
            }`}
          >
            <p className="mb-4 font-body text-sm text-charcoal">
              {mode === "bulk"
                ? "Pick as many card photos as you want — each one will be scanned and filed."
                : "Add photos from your library, or take a new one. Scan fills the form for you."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="cf-btn cf-btn-primary cursor-pointer">
                Choose from library
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="cf-btn cursor-pointer">
                Take photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {previews.map((item, index) => (
                <div
                  key={`${item.file.name}-${item.file.size}-${index}`}
                  className="relative overflow-hidden border border-ink/25 bg-cream"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1 top-1 border border-ink bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] text-ink"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    ×
                  </button>
                  {mode === "bulk" && (
                    <p className="truncate border-t border-ink/15 px-1 py-1 font-mono text-[0.55rem] text-charcoal">
                      {fileLabel(item.file)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {mode === "single" && files.length > 0 && (
            <button
              type="button"
              disabled={!scanEnabled || pending}
              onClick={() => scanFirstPhotoMutation.mutate()}
              className="cf-btn mt-4 w-full sm:w-auto"
            >
              {scanFirstPhotoMutation.isPending
                ? "Scanning…"
                : "Scan first photo"}
            </button>
          )}
        </section>

        {mode === "single" ? (
          <section className="cf-panel p-4 sm:p-5">
            <h2 className="mb-4 font-display text-lg text-ink">Details</h2>
            {scanNote && (
              <p className="mb-4 border border-sage/40 bg-cream px-3 py-2 font-body text-sm text-sage">
                {scanNote}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name / player" required>
                <input
                  required={mode === "single"}
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
                  required={mode === "single"}
                  type="number"
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  className="cf-input font-mono"
                />
              </Field>
              <Field label="Brand">
                <input
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="Topps, Score, Panini…"
                  className="cf-input"
                />
              </Field>
              <Field label="Set name" required>
                <input
                  required={mode === "single"}
                  value={form.setName}
                  onChange={(e) => update("setName", e.target.value)}
                  placeholder="Chrome, Series 1, Base Set…"
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
        ) : (
          <section className="cf-panel p-4 sm:p-5">
            <h2 className="mb-2 font-display text-lg text-ink">
              Fallback defaults
            </h2>
            <p className="mb-4 font-body text-sm text-charcoal">
              Used only when a scan can&apos;t read a field. With scanning on,
              most cards fill themselves.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <Field label="Year">
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => update("year", e.target.value)}
                  className="cf-input font-mono"
                />
              </Field>
              <Field label="Brand (optional)">
                <input
                  value={form.brand}
                  onChange={(e) => update("brand", e.target.value)}
                  placeholder="Topps, Score, Panini…"
                  className="cf-input"
                />
              </Field>
              <Field label="Set name (optional)">
                <input
                  value={form.setName}
                  onChange={(e) => update("setName", e.target.value)}
                  placeholder="Defaults to Unsorted"
                  className="cf-input"
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
        )}

        <section className="cf-panel p-4 sm:p-5">
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

        {(error || bulkProgress) && (
          <p
            className={`border-2 px-3 py-2 font-body text-sm ${
              error
                ? "border-stamp bg-paper text-stamp"
                : "border-sage bg-paper text-sage"
            }`}
          >
            {error || bulkProgress}
          </p>
        )}

        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:flex-wrap">
          {mode === "single" ? (
            <>
              <button
                type="submit"
                disabled={pending}
                className="cf-btn cf-btn-primary w-full sm:w-auto"
              >
                {pending && singleMutation.isPending ? "Saving…" : "Save card"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => singleMutation.mutate(true)}
                className="cf-btn w-full sm:w-auto"
              >
                Save & add another
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={pending || files.length === 0}
              className="cf-btn cf-btn-primary w-full sm:w-auto"
            >
              {pending
                ? bulkProgress || "Importing…"
                : `Import ${files.length || ""} card${files.length === 1 ? "" : "s"}`}
            </button>
          )}
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
