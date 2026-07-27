"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/app/collection", label: "Collection" },
  { href: "/app/cards/new", label: "Add card" },
];

export function AppMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink"
      >
        <span className="sr-only">Menu</span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-opacity ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-ink transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-ink/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-4 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] border-2 border-ink bg-paper shadow-[6px_6px_0_rgba(34,40,58,0.12)] sm:right-5">
            <p className="cf-label border-b border-ink/15 px-4 py-2">Menu</p>
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/app/collection" &&
                    pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`border-b border-ink/10 px-4 py-3.5 font-body text-sm no-underline last:border-b-0 ${
                      active
                        ? "bg-cream font-medium text-ink"
                        : "text-charcoal hover:bg-cream"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
