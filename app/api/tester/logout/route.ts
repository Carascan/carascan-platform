import { NextResponse } from "next/server";

const COOKIE_NAME = "carascan_tester_portal";

export async function POST(req: Request) {
  const response = NextResponse.redirect(new URL("/tester/login", req.url));

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}