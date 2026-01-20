import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
];

// Check if a path matches any public route
function isPublicRoute(path: string): boolean {
    return publicRoutes.some((route) => path.startsWith(route));
}

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip for static files and internal paths
    if (
        path.startsWith("/_next") ||
        path.startsWith("/api/_") ||
        path.includes(".")
    ) {
        return NextResponse.next();
    }

    // Skip auth for public routes
    if (isPublicRoute(path)) {
        return NextResponse.next();
    }

    // For protected routes, we'll rely on Clerk's built-in middleware
    // This is a simple passthrough - Clerk handles auth in layout/pages
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
