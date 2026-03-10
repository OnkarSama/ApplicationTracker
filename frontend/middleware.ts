import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/","/login", "/signup"];
const RAILS_API = process.env.NEXT_PUBLIC_API_URL;

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isPublic =
        PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname === "/";

    const cookieHeader = req.headers.get("cookie") ?? "";

    // Check session once for both public and protected paths
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

    // Logged-in user trying to access login/signup — bounce to dashboard
    if (isPublic) {
        if (isAuthenticated) {
            const url = req.nextUrl.clone();
            url.pathname = req.nextUrl.searchParams.get("redirect") || "/dashboard";
            url.searchParams.delete("redirect");
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // Protected route, not authenticated — redirect to login
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