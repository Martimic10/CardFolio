"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PRO_PLANS, type PlanId } from "@/lib/plans";

type Props = {
  open: boolean;
  onClose: () => void;
  reason?: string;
};

export function UpgradePopup({ open, onClose, reason }: Props) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function choosePlan(plan: Exclude<PlanId, "free">) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      if (data.mock) {
        onClose();
        window.location.href = data.url ?? "/app/account?upgraded=1";
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close upgrade dialog"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="relative z-10 w-full max-w-md border-2 border-ink bg-paper shadow-[8px_8px_0_rgba(34,40,58,0.15)]"
      >
        <div className="flex items-start justify-between border-b-2 border-ink bg-cream px-4 py-3">
          <div>
            <p className="cf-label">Upgrade</p>
            <h2 id="upgrade-title" className="font-display text-xl text-ink">
              Go Pro
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-ink bg-paper font-mono text-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-4">
          {reason && (
            <p className="font-body text-sm text-charcoal">{reason}</p>
          )}
          <p className="font-body text-sm text-charcoal">
            Unlimited cards, automatic pricing, price history, and market
            trends.
          </p>

          <div className="space-y-3">
            {PRO_PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                disabled={loading != null}
                onClick={() => choosePlan(plan.id)}
                className="flex w-full flex-col items-start gap-1 border-2 border-ink bg-cream px-4 py-3 text-left transition-colors hover:bg-manila/30 disabled:opacity-60"
              >
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className="font-display text-lg text-ink">
                    {plan.name}
                  </span>
                  <span className="font-mono text-sm font-medium text-stamp">
                    {loading === plan.id ? "…" : plan.priceLabel}
                  </span>
                </span>
                <span className="font-body text-xs text-charcoal">
                  {plan.description}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <p className="font-body text-sm text-stamp">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
