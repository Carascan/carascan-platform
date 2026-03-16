import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin routes
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
  matcher: ["/admin/:path*"],
};