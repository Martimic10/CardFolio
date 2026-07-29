"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-11 w-24 animate-pulse border-2 border-ink/20 bg-cream/50" />
    );
  }

  if (!isSignedIn) {
    return (
      <>
        <Link
          href="/sign-in"
          className="hidden min-h-11 items-center border-2 border-ink bg-transparent px-3 py-2 font-body text-sm font-medium text-ink no-underline transition-colors hover:bg-paper sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex min-h-11 items-center border-2 border-ink bg-ink px-3 py-2 font-body text-sm font-medium text-paper no-underline transition-opacity hover:opacity-90 sm:px-3.5"
        >
          <span className="sm:hidden">Start</span>
          <span className="hidden sm:inline">Sign up</span>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/app/collection"
        className="inline-flex min-h-11 items-center border-2 border-ink bg-ink px-3 py-2 font-body text-sm font-medium text-paper no-underline transition-opacity hover:opacity-90 sm:px-3.5"
      >
        Collection
      </Link>
      <UserButton />
    </>
  );
}
