"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <>
        <SignInButton mode="modal" forceRedirectUrl="/app/collection">
          <button
            type="button"
            className="hidden min-h-11 border-2 border-ink bg-transparent px-3 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-paper sm:inline-flex sm:items-center"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal" forceRedirectUrl="/app/collection">
          <button
            type="button"
            className="min-h-11 border-2 border-ink bg-ink px-3 py-2 font-body text-sm font-medium text-paper transition-opacity hover:opacity-90 sm:px-3.5"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Sign up</span>
          </button>
        </SignUpButton>
      </>
    );
  }

  return (
    <>
      <Link
        href="/app/collection"
        className="min-h-11 border-2 border-ink bg-ink px-3 py-2 font-body text-sm font-medium text-paper no-underline transition-opacity hover:opacity-90 sm:px-3.5"
      >
        Collection
      </Link>
      <UserButton />
    </>
  );
}
