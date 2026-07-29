"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe } from "@/lib/api";
import { FREE_CARD_LIMIT, PRO_PLANS } from "@/lib/plans";
import { UpgradePopup } from "@/components/app/UpgradePopup";

const FREE_FEATURES = [
  "Up to 50 catalogued cards",
  "Manual photos & condition sliders",
  "Manual price updates",
  "Search, filter, and sort",
];

const PRO_FEATURES = [
  "Unlimited cards",
  "Automatic price estimates",
  "Full price history",
  "Market trends & movers",
  "30-day value change",
];

export function AccountBillingView() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { signOut, openUserProfile } = useClerk();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(
    searchParams.get("upgraded")
      ? "Welcome to Pro — your plan is active."
      : searchParams.get("canceled")
        ? "Checkout canceled. You’re still on Free."
        : null,
  );
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  // After Stripe Checkout redirect, sync plan from session_id (complements webhooks).
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId || !searchParams.get("upgraded")) return;

    let cancelled = false;
    (async () => {
      setSyncing(true);
      try {
        const res = await fetch("/api/billing/sync-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!cancelled) {
          if (res.ok) {
            await queryClient.invalidateQueries({ queryKey: ["me"] });
            setMessage("Welcome to Pro — your plan is active.");
          } else if (data.error) {
            setMessage(data.error);
          }
        }
      } catch {
        if (!cancelled) {
          setMessage(
            "Payment received — plan will update when the webhook arrives.",
          );
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, queryClient]);

  async function openPortal() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal failed");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.message ?? "Could not open billing portal");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Portal failed");
    } finally {
      setBusy(false);
    }
  }

  if (meQuery.isLoading) {
    return (
      <div className="cf-panel px-6 py-16 text-center font-body text-sm text-charcoal">
        Loading settings…
      </div>
    );
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <div className="border-2 border-stamp bg-paper px-6 py-4 font-body text-sm text-stamp">
        Could not load account.{" "}
        <Link href="/app/collection" className="underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const me = meQuery.data;
  const limit = me.cardLimit ?? FREE_CARD_LIMIT;
  const used = me.uniqueCards;
  const remaining = me.cardsRemaining ?? Math.max(0, limit - used);
  const usagePct = me.hasProAccess
    ? 0
    : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 min-[900px]:space-y-6">
      <div>
        <p className="cf-label mb-2">Account desk</p>
        <h1 className="font-display text-2xl text-ink min-[900px]:text-3xl">
          Settings
        </h1>
        <p className="mt-2 font-body text-sm text-charcoal">
          Profile, plan, and catalog limits.
        </p>
      </div>

      {syncing && (
        <p className="border-2 border-ink bg-cream px-4 py-3 font-body text-sm text-charcoal">
          Confirming your Stripe payment…
        </p>
      )}

      {message && (
        <div className="flex items-start justify-between gap-3 border-2 border-sage bg-paper px-4 py-3">
          <p className="font-body text-sm text-sage">{message}</p>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="shrink-0 font-mono text-xs text-sage underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile */}
      <section className="cf-panel overflow-hidden">
        <div className="border-b-2 border-ink bg-cream/60 px-4 py-3 min-[900px]:px-5">
          <h2 className="font-display text-lg text-ink">Profile</h2>
        </div>
        <div className="space-y-4 p-4 min-[900px]:p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="border-b border-dotted border-manila pb-3 sm:border-b-0 sm:pb-0">
              <dt className="cf-label">Name</dt>
              <dd className="mt-1 font-body text-sm text-ink">
                {me.name || "—"}
              </dd>
            </div>
            <div>
              <dt className="cf-label">Email</dt>
              <dd className="mt-1 break-all font-body text-sm text-ink">
                {me.email}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => openUserProfile()}
              className="cf-btn"
            >
              Manage profile
            </button>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: "/" })}
              className="cf-btn border-stamp text-stamp hover:bg-stamp hover:text-paper"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Plan */}
      <section className="cf-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-cream/60 px-4 py-3 min-[900px]:px-5">
          <h2 className="font-display text-lg text-ink">Plan</h2>
          <span
            className={`border-2 px-2.5 py-1 font-mono text-xs font-medium tracking-wide uppercase ${
              me.hasProAccess
                ? "border-ink bg-ink text-paper"
                : "border-ink bg-paper text-ink"
            }`}
          >
            {me.planLabel}
          </span>
        </div>

        <div className="space-y-5 p-4 min-[900px]:p-5">
          {!me.hasProAccess && (
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="cf-label">Catalog usage</p>
                <p className="font-mono text-xs tabular-nums text-charcoal">
                  {used} / {limit} cards · {remaining} left
                </p>
              </div>
              <div className="h-3 border-2 border-ink bg-cream">
                <div
                  className={`h-full ${
                    usagePct >= 90 ? "bg-stamp" : "bg-ink"
                  }`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              {usagePct >= 90 && (
                <p className="mt-2 font-body text-xs text-stamp">
                  You’re near the free limit. Upgrade for unlimited cards.
                </p>
              )}
            </div>
          )}

          {me.hasProAccess && (
            <p className="font-body text-sm text-charcoal">
              Pro is active — unlimited cataloging, auto pricing, price history,
              and market tools.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureList
              title="Free"
              items={FREE_FEATURES}
              active={!me.hasProAccess}
            />
            <FeatureList
              title="Pro"
              items={PRO_FEATURES}
              active={me.hasProAccess}
              highlight
            />
          </div>

          {!me.hasProAccess && (
            <div className="grid gap-3 sm:grid-cols-2">
              {PRO_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="flex flex-col items-start gap-1 border-2 border-ink bg-cream px-4 py-3 text-left transition-colors hover:bg-manila/30"
                >
                  <span className="flex w-full items-baseline justify-between gap-2">
                    <span className="font-display text-base text-ink">
                      {plan.name}
                    </span>
                    <span className="font-mono text-sm font-medium text-stamp">
                      {plan.priceLabel}
                    </span>
                  </span>
                  <span className="font-body text-xs text-charcoal">
                    {plan.description}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-dotted border-manila pt-4">
            {!me.hasProAccess && (
              <button
                type="button"
                className="cf-btn cf-btn-primary"
                onClick={() => setUpgradeOpen(true)}
              >
                Upgrade to Pro
              </button>
            )}
            {me.hasProAccess && me.plan === "pro_monthly" && (
              <button
                type="button"
                className="cf-btn"
                disabled={busy}
                onClick={() => openPortal()}
              >
                {busy ? "Opening…" : "Manage subscription"}
              </button>
            )}
            <Link href="/app/collection" className="cf-btn">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>

      <UpgradePopup
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Pick a Pro plan to unlock unlimited cataloging and market tools."
      />
    </div>
  );
}

function FeatureList({
  title,
  items,
  active,
  highlight,
}: {
  title: string;
  items: string[];
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border-2 border-ink p-3.5 ${
        active ? (highlight ? "bg-ink text-paper" : "bg-cream") : "bg-paper"
      }`}
    >
      <p
        className={`font-mono text-[0.65rem] tracking-[0.1em] uppercase ${
          active && highlight ? "text-manila" : "text-sage"
        }`}
      >
        {title}
        {active ? " · current" : ""}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={`font-body text-sm ${
              active && highlight ? "text-paper/90" : "text-charcoal"
            }`}
          >
            <span className={active && highlight ? "text-manila" : "text-sage"}>
              ·{" "}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
