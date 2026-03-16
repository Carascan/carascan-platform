import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const sb = supabaseAdmin();

  try {
    const { slug } = await context.params;

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select(`
        id,
        slug,
        identifier,
        status,
        contact_enabled,
        emergency_enabled,
        preferred_contact_channel
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 },
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    const { data: profile } = await sb
      .from("plate_profiles")
      .select("caravan_name, bio, owner_photo_url")
      .eq("plate_id", plate.id)
      .maybeSingle();

    const { data: contacts } = await sb
      .from("emergency_contacts")
      .select("name, relationship, phone, email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    return NextResponse.json({
      plate,
      profile: profile ?? null,
      contacts: contacts ?? [],
    });
  } catch (error) {
    console.error("Plate route failed:", error);

    return NextResponse.json(
      { error: "Failed to load plate data" },
      { status: 500 },
    );
  }
}