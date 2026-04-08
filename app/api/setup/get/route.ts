import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: tokenRow, error: tokenError } = await sb
    .from("plate_setup_tokens")
    .select("plate_id, expires_at, email, used_at, revoked_at")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (tokenRow.revoked_at) {
    return NextResponse.json(
      { error: "Token has been revoked" },
      { status: 410 }
    );
  }

  if (tokenRow.used_at) {
    return NextResponse.json(
      { error: "This setup link has already been used" },
      { status: 410 }
    );
  }

  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  const plateId = tokenRow.plate_id;

  const [plateRes, profileRes, designRes, contactsRes] = await Promise.all([
    sb
      .from("plates")
      .select(
        "id, identifier, slug, status, contact_enabled, emergency_enabled, preferred_contact_channel, report_channel, sku, emergency_plan"
      )
      .eq("id", plateId)
      .maybeSingle(),

    sb
      .from("plate_profiles")
      .select("plate_id, caravan_name, bio, owner_photo_url")
      .eq("plate_id", plateId)
      .maybeSingle(),

    sb
      .from("plate_designs")
      .select(
        "plate_id, text_line_1, text_line_2, logo_url, qr_url, proof_approved, plate_width_mm, plate_height_mm, qr_size_mm, hole_diameter_mm"
      )
      .eq("plate_id", plateId)
      .maybeSingle(),

    sb
      .from("emergency_contacts")
      .select("id, name, relationship, phone, email, enabled")
      .eq("plate_id", plateId)
      .order("created_at", { ascending: true }),
  ]);

  if (plateRes.error) {
    return NextResponse.json(
      { error: `Plate fetch failed: ${plateRes.error.message}` },
      { status: 500 }
    );
  }

  if (!plateRes.data) {
    return NextResponse.json({ error: "Plate not found" }, { status: 404 });
  }

  if (profileRes.error) {
    return NextResponse.json(
      { error: `Profile fetch failed: ${profileRes.error.message}` },
      { status: 500 }
    );
  }

  if (designRes.error) {
    return NextResponse.json(
      { error: `Design fetch failed: ${designRes.error.message}` },
      { status: 500 }
    );
  }

  if (contactsRes.error) {
    return NextResponse.json(
      { error: `Contacts fetch failed: ${contactsRes.error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    plateId,
    email: tokenRow.email ?? null,
    plate: plateRes.data,
    profile: profileRes.data ?? null,
    design: designRes.data ?? null,
    contacts: contactsRes.data ?? [],
  });
}