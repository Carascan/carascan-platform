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

    let { data: plate, error: plateError } = await sb
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
      plateError = fallback.error;
    }

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json(
        { error: "Plate not found." },
        { status: 404 }
      );
    }

    const [{ data: design, error: designError }, { data: profile, error: profileError }] =
      await Promise.all([
        sb.from("plate_designs").select("*").eq("plate_id", plate.id).maybeSingle(),
        sb.from("plate_profiles").select("*").eq("plate_id", plate.id).maybeSingle(),
      ]);

    if (designError) {
      return NextResponse.json(
        { error: `Plate design lookup failed: ${designError.message}` },
        { status: 500 }
      );
    }

    if (profileError) {
      return NextResponse.json(
        { error: `Plate profile lookup failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      route_version: "plates-get-v4",
      plate,
      design: design ?? null,
      profile: profile ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load plate.",
      },
      { status: 500 }
    );
  }
}