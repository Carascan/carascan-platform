import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ENV } from "@/lib/env";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const plateId = url.searchParams.get("plateId");

    if (!plateId) {
      return NextResponse.json(
        { error: "Missing plateId" },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from("plate_setup_tokens")
      .select("token, used_at, revoked_at, expires_at")
      .eq("plate_id", plateId)
      .is("used_at", null)
      .is("revoked_at", null)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to load setup token: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data?.token) {
      return NextResponse.json(
        { error: "No active setup token found for this plate." },
        { status: 404 }
      );
    }

    const redirectUrl = `${ENV.APP_BASE_URL}/setup/${encodeURIComponent(
      data.token
    )}`;

    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.json(
      { error: "Failed to open setup page." },
      { status: 500 }
    );
  }
}