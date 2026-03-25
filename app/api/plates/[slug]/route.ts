import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const input = String(slug ?? "").trim();

    if (!input) {
      return NextResponse.json(
        { error: "Plate key is required." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    let { data: plate, error } = await sb
      .from("plates")
      .select("*")
      .eq("identifier", input.toUpperCase())
      .maybeSingle();

    if (!plate) {
      const fallback = await sb
        .from("plates")
        .select("*")
        .eq("slug", input)
        .maybeSingle();

      plate = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${error.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json(
        { error: "Plate not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      route_version: "plates-get-v2",
      plate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load plate.",
      },
      { status: 500 }
    );
  }
}