import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = supabaseAdmin();

  const { data: plate, error: plateError } = await supabase
    .from("plates")
    .select(
      "id, slug, identifier, contact_enabled, emergency_enabled, preferred_contact_channel"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (plateError) {
    return NextResponse.json({ error: plateError.message }, { status: 500 });
  }

  if (!plate) {
    return NextResponse.json({ error: "Plate not found" }, { status: 404 });
  }

  const [{ data: profile }, { data: design }] = await Promise.all([
    supabase
      .from("plate_profiles")
      .select("caravan_name, bio, owner_photo_url")
      .eq("plate_id", plate.id)
      .maybeSingle(),
    supabase
      .from("plate_designs")
      .select("qr_url, logo_url")
      .eq("plate_id", plate.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    plate,
    profile: profile ?? null,
    design: design ?? null,
  });
}