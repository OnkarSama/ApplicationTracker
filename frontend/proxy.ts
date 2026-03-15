import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/"];
const REFERRER_GATED_PATHS: { path: string; allowedReferrers: string[]; fallback?: string }[] = [
    { path: "/onboarding", allowedReferrers: ["/signup"], fallback: "/" },
];
const RAILS_API = "http://localhost:4000";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isApiRoute = pathname.startsWith("/api");
    if (isApiRoute) return NextResponse.next();

    const isPublic =
        PUBLIC_PATHS.some((p) => pathname === p || (p !== "/" && pathname.startsWith(p))) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon");

    const referrerGate = REFERRER_GATED_PATHS.find(({ path }) =>
        pathname === path || pathname.startsWith(path)
    );

    const cookieHeader = req.headers.get("cookie") ?? "";
    let isAuthenticated = false;
    if (cookieHeader) {
        try {
            const res = await fetch(`${RAILS_API}/api/session`, {
                headers: { Cookie: cookieHeader, Accept: "application/json" },
                cache: "no-store",
            });
            isAuthenticated = res.ok;
        } catch {}
    }

    // Referrer-gated paths (e.g. /onboarding — only reachable from /signup)
    if (referrerGate) {
        const referrer = req.headers.get("referer") ?? "";
        const referrerPath = referrer ? new URL(referrer).pathname : "";
        const isAllowedReferrer = referrerGate.allowedReferrers.some(
            (r) => referrerPath === r || referrerPath.startsWith(r)
        );

        if (!isAllowedReferrer) {
            const url = req.nextUrl.clone();
            url.pathname = referrerGate.fallback ?? (isAuthenticated ? "/dashboard" : "/login");
            url.searchParams.delete("redirect");
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    // Logged-in user trying to access login/signup — bounce to dashboard
    if (isPublic) {
        if (isAuthenticated) {
            const url = req.nextUrl.clone();
            const redirectTo = req.nextUrl.searchParams.get("redirect") || "/dashboard";
            url.pathname = redirectTo === "/login" || redirectTo === "/signup" ? "/dashboard" : redirectTo;
            url.searchParams.delete("redirect");
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    if (!isAuthenticated) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};