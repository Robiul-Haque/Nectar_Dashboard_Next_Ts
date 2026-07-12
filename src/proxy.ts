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

    const token = req.cookies.get("accessToken")?.value;

    const isLoginPage = req.nextUrl.pathname === "/login";
    const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

    // Token is missing or expired → redirect to login
    const tokenMissingOrExpired = !token || isTokenExpired(token);

    if (tokenMissingOrExpired && isProtected) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && !isTokenExpired(token) && isLoginPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"]
};
