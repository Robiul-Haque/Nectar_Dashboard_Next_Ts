import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight JWT expiry check without full verification.
 * We only decode the payload (no signature verify) to check 'exp'.
 * Full signature verification happens on the backend for every API call.
 */
function isTokenExpired(token: string): boolean {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return true;
        // Base64url decode the payload
        const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
        );
        if (!payload.exp) return false;
        // Add 10-second buffer to avoid edge-case race conditions
        return Date.now() >= (payload.exp * 1000) - 10_000;
    } catch {
        return true; // treat malformed tokens as expired
    }
}

export function proxy(req: NextRequest) {
    // Allow Server Actions to pass through without redirecting.
    // They are POST requests and middleware redirection will crash the client.
    if (req.headers.has("next-action")) {
        return NextResponse.next();
    }

    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    const isLoginPage = req.nextUrl.pathname === "/login";
    const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

    const hasValidAccessToken = Boolean(accessToken && !isTokenExpired(accessToken));
    const hasValidRefreshToken = Boolean(refreshToken && !isTokenExpired(refreshToken));
    const isAuthenticated = hasValidAccessToken || hasValidRefreshToken;

    // Protected route: user has neither valid access nor valid refresh token → redirect to login
    if (isProtected && !isAuthenticated) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Login page: redirect to dashboard only if user has an active, valid access token
    if (isLoginPage && hasValidAccessToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"]
};
