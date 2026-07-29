import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/app(.*)",
  "/api/cards(.*)",
  "/api/upload(.*)",
  "/api/billing(.*)",
  "/api/me(.*)",
]);

const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

/**
 * Without Clerk keys, clerkMiddleware throws and Vercel returns
 * MIDDLEWARE_INVOCATION_FAILED on every route. Fall back so the
 * marketing site still loads while env vars are being configured.
 */
const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function clerkKeysMissing(req: NextRequest) {
      if (isProtectedRoute(req)) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        // Prefer a soft redirect for pages; APIs get a clear JSON error.
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json(
            {
              error:
                "Clerk is not configured on this deployment. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in Vercel, then redeploy.",
            },
            { status: 503 },
          );
        }
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
