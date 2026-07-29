"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { UpgradePopup } from "@/components/app/UpgradePopup";
import { fetchMe } from "@/lib/api";

const nav = [
  { href: "/app/collection", label: "Dashboard", icon: "grid" as const },
  { href: "/app/cards/new", label: "Add card", icon: "plus" as const },
  {
    href: "/app/market",
    label: "Market trends",
    icon: "chart" as const,
    pro: true,
  },
  { href: "/app/account", label: "Settings", icon: "gear" as const },
];

function NavIcon({ name }: { name: (typeof nav)[number]["icon"] }) {
  const common = "h-[18px] w-[18px]";
  switch (name) {
    case "grid":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.75" />
          <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="1.75" />
          <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.75" />
          <rect x="13" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "plus":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M8 15l3.5-4 3 2.5L18 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "gear":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 3.5v2.2M12 18.3v2.2M4.9 6.5l1.6 1.6M17.5 15.9l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.9 17.5l1.6-1.6M17.5 8.1l1.6-1.6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

function isActive(pathname: string, href: string) {
  if (href === "/app/collection") {
    return pathname === "/app/collection" || pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const meQuery = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const hasPro = meQuery.data?.hasProAccess ?? false;
  const planLabel = meQuery.data?.planLabel ?? "Free";
  const hideFab =
    pathname.startsWith("/app/cards/new") ||
    pathname.match(/^\/app\/cards\/[^/]+$/) != null;

  return (
    <div className="marketing-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] flex-col border-r-2 border-ink bg-paper/95 min-[900px]:flex">
        <div className="flex items-center gap-2.5 border-b-2 border-ink px-4 py-4">
          <Link href="/" className="group flex items-center gap-2.5 no-underline">
            <BrandMark
              size={36}
              priority
              className="-rotate-6 border-2 border-ink shadow-[3px_3px_0_rgba(34,40,58,0.18)] transition-transform group-hover:rotate-[-3deg]"
            />
            <span className="flex flex-col">
              <span className="font-display text-lg tracking-wide text-ink">
                Cardfolio
              </span>
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-sage">
                Catalog desk
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0 px-2 py-3" aria-label="Main">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 border-2 px-3 py-2.5 font-body text-sm no-underline transition-colors ${
                  active
                    ? "border-ink bg-cream text-ink"
                    : "border-transparent text-charcoal hover:border-ink/20 hover:bg-cream/60"
                }`}
              >
                <span className={active ? "text-ink" : "text-sage"}>
                  <NavIcon name={item.icon} />
                </span>
                <span className="flex-1">{item.label}</span>
                {item.pro && (
                  <span className="border border-ink/30 bg-cream px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wide text-sage uppercase">
                    Pro
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-ink p-3">
          <div className="border-2 border-ink bg-cream p-3">
            <p className="cf-label">Current plan</p>
            <p className="mt-1 font-display text-base text-ink">{planLabel}</p>
            {!hasPro && (
              <button
                type="button"
                onClick={() => setUpgradeOpen(true)}
                className="cf-btn cf-btn-primary mt-3 w-full text-xs"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
          <div className="mt-3 flex justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border-2 border-ink rounded-none",
                },
              }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur-md min-[900px]:hidden">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <BrandMark
            size={32}
            className="-rotate-6 border-2 border-ink"
          />
          <span className="font-display text-base tracking-wide text-ink">
            Cardfolio
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="border border-ink/30 bg-cream px-2 py-0.5 font-mono text-[0.6rem] tracking-wide text-sage uppercase">
            {planLabel}
          </span>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 border-2 border-ink rounded-none",
              },
            }}
          />
        </div>
      </header>

      <main className="dash-main min-[900px]:ml-[220px]">{children}</main>

      {!hideFab && (
        <Link
          href="/app/cards/new"
          aria-label="Add card"
          className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-40 flex h-14 w-14 items-center justify-center border-2 border-ink bg-ink text-paper shadow-[4px_4px_0_rgba(34,40,58,0.2)] min-[900px]:hidden"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t-2 border-ink bg-paper/97 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md min-[900px]:hidden"
        aria-label="Mobile"
      >
        {nav.map((item) => {
          const active = isActive(pathname, item.href);
          const short =
            item.label === "Market trends"
              ? "Market"
              : item.label === "Add card"
                ? "Add"
                : item.label === "Dashboard"
                  ? "Home"
                  : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 no-underline ${
                active ? "bg-cream text-ink" : "text-charcoal"
              }`}
            >
              <NavIcon name={item.icon} />
              <span className="font-mono text-[0.55rem] tracking-wide uppercase">
                {short}
              </span>
              {item.pro && (
                <span className="absolute top-1 right-[14%] border border-ink/25 bg-cream px-1 font-mono text-[0.45rem] text-sage uppercase">
                  Pro
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <UpgradePopup
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Upgrade for unlimited cards, market trends, and price history."
      />
    </div>
  );
}
