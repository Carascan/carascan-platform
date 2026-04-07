import { NextResponse } from "next/server";

const COOKIE_NAME = "carascan_tester_portal";

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function readAllowedNames() {
  const raw =
    process.env.TESTER_PORTAL_NAMES ||
    "nathan,john,sarah,michael,emma,tester";

  return raw
    .split(",")
    .map((name) => normalizeName(name))
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const firstName = String(body?.firstName ?? "").trim();
    const password = String(body?.password ?? "").trim();

    if (!firstName || !password) {
      return NextResponse.json(
        { error: "First name and password are required." },
        { status: 400 }
      );
    }

    const allowedNames = readAllowedNames();
    const sharedPassword = process.env.TESTER_PORTAL_PASSWORD || "admin";
    const validName = allowedNames.includes(normalizeName(firstName));
    const validPassword = password === sharedPassword;

    if (!validName || !validPassword) {
      return NextResponse.json(
        { error: "Access not approved for this tester login." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set(
      COOKIE_NAME,
      JSON.stringify({
        firstName,
      }),
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );

    return response;
  } catch (error) {
    console.error("Tester login failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}