"use client";

import { ClerkLoaded, ClerkLoading, SignIn, SignUp, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

type AuthMode = "sign-in" | "sign-up";

function AuthError({ mode }: { mode: AuthMode }) {
  const clerk = useClerk();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!clerk.loaded) setShow(true);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [clerk.loaded]);

  if (!show) return null;

  return (
    <div className="mx-auto mt-6 max-w-md border-2 border-stamp bg-paper px-4 py-4 text-left">
      <p className="font-display text-lg text-ink">
        {mode === "sign-in" ? "Sign in" : "Sign up"} couldn’t load
      </p>
      <p className="mt-2 font-body text-sm leading-relaxed text-charcoal">
        Auth couldn’t reach Clerk from this domain. On a{" "}
        <code className="font-mono text-xs">*.vercel.app</code> site, use Development Clerk keys (
        <code className="font-mono text-xs">pk_test_</code> /{" "}
        <code className="font-mono text-xs">sk_test_</code>) in Vercel, then redeploy — or attach a
        custom domain for Production keys.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center border-2 border-ink bg-ink px-4 py-2 font-body text-sm font-medium text-paper no-underline"
      >
        Back home
      </Link>
    </div>
  );
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <div className="marketing-surface flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <ClerkLoading>
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 animate-pulse border-2 border-ink bg-cream"
            aria-hidden
          />
          <p className="font-mono text-xs tracking-[0.14em] text-sage uppercase">
            Loading {mode === "sign-in" ? "sign in" : "sign up"}…
          </p>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        {mode === "sign-in" ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/app/collection"
            fallbackRedirectUrl="/app/collection"
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/app/collection"
            fallbackRedirectUrl="/app/collection"
          />
        )}
      </ClerkLoaded>

      <AuthError mode={mode} />
    </div>
  );
}
