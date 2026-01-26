import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    // Admin bypass mode - set ADMIN_MODE=true in .env.local for full access
    const isAdminMode = process.env.ADMIN_MODE === "true";

    if (isAdminMode) {
        // Skip all auth checks in admin mode
        return NextResponse.next();
    }

    const session = await auth.api.getSession({
        headers: request.headers
    });

    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") ||
        request.nextUrl.pathname.startsWith("/sign-up");

    if (isDashboard && !session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (isAuthPage && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
