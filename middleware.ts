import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TESTER_COOKIE_NAME = "carascan_tester_portal";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  //
  // TESTER PORTAL PROTECTION
  //
  // Allow the login page itself, but protect all other /tester routes
  //
  if (pathname.startsWith("/tester")) {
    if (pathname === "/tester/login") {
      return NextResponse.next();
    }

    const testerCookie = request.cookies.get(TESTER_COOKIE_NAME)?.value;

    if (!testerCookie) {
      return NextResponse.redirect(new URL("/tester/login", request.url));
    }

    return NextResponse.next();
  }

  //
  // ADMIN PROTECTION
  //
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const adminToken = process.env.ADMIN_ACTION_SECRET;

  // If token isn't configured, never allow admin routes
  if (!adminToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const urlToken = request.nextUrl.searchParams.get("token");
  const cookieToken = request.cookies.get("admin_token")?.value;

  // First-time access via URL token
  if (urlToken && urlToken === adminToken) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("token");

    const response = NextResponse.redirect(cleanUrl);

    response.cookies.set("admin_token", adminToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  }

  // Existing authenticated cookie
  if (cookieToken === adminToken) {
    return NextResponse.next();
  }

  // Otherwise block
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/tester/:path*"],
};