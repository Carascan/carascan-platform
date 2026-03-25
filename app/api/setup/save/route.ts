import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

type SetupSaveBody = {
  token?: string;
  caravan_name?: string;
  bio?: string | null;
  contact_enabled?: boolean;
  emergency_enabled?: boolean;
  contact_channel?: "email" | "sms" | "both" | string;
  report_channel?: "email" | "sms" | "both" | string;
  mounting_holes?: boolean;
  emergency_contacts?: Array<{
    name?: string;
    phone?: string;
    email?: string;
    enabled?: boolean;
  }>;
};

function normalizePhone(value: string) {
  return String(value ?? "").replace(/\s+/g, "");
}

function cleanChannel(value: unknown) {
  return value === "sms" || value === "both" ? value : "email";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SetupSaveBody;
    const supabase = supabaseAdmin();

    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { data: tokenRow, error: tokenLookupError } = await supabase
      .from("plate_setup_tokens")
      .select("token, plate_id, expires_at, used_at, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenLookupError) {
      return NextResponse.json(
        { error: `Token lookup failed: ${tokenLookupError.message}` },
        { status: 500 }
      );
    }

    if (!tokenRow) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (tokenRow.revoked_at || tokenRow.used_at) {
      return NextResponse.json({ error: "Token invalid" }, { status: 400 });
    }

    if (
      tokenRow.expires_at &&
      new Date(tokenRow.expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const caravanName =
      typeof body.caravan_name === "string" ? body.caravan_name.trim() : "";

    const bio =
      typeof body.bio === "string" && body.bio.trim() !== ""
        ? body.bio.trim()
        : null;

    const contactEnabled = body.contact_enabled !== false;
    const emergencyEnabled = body.emergency_enabled !== false;
    const contactChannel = cleanChannel(body.contact_channel);
    const reportChannel = cleanChannel(body.report_channel);
    const mountingHoles = body.mounting_holes !== false;

    const emergencyContacts = Array.isArray(body.emergency_contacts)
      ? body.emergency_contacts
          .slice(0, 3)
          .map((c) => ({
            plate_id: tokenRow.plate_id,
            name: c.name?.trim() ?? "",
            phone: c.phone ? normalizePhone(c.phone) : "",
            email: c.email?.trim() ?? "",
            enabled: c.enabled !== false,
          }))
          .filter((c) => c.name || c.phone || c.email)
      : [];

    const { error: profileError } = await supabase.from("plate_profiles").upsert(
      {
        plate_id: tokenRow.plate_id,
        caravan_name: caravanName,
        bio,
      },
      { onConflict: "plate_id" }
    );

    if (profileError) {
      return NextResponse.json(
        { error: `Profile save failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    const { error: plateError } = await supabase
      .from("plates")
      .update({
        contact_enabled: contactEnabled,
        emergency_enabled: emergencyEnabled,
        preferred_contact_channel: contactChannel,
        report_channel: reportChannel,
        status: "active",
      })
      .eq("id", tokenRow.plate_id);

    if (plateError) {
      return NextResponse.json(
        { error: `Plate update failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    const { error: designError } = await supabase.from("plate_designs").upsert(
      {
        plate_id: tokenRow.plate_id,
        mounting_holes: mountingHoles,
      },
      { onConflict: "plate_id" }
    );

    if (designError) {
      return NextResponse.json(
        { error: `Design update failed: ${designError.message}` },
        { status: 500 }
      );
    }

    const { error: deleteContactsError } = await supabase
      .from("emergency_contacts")
      .delete()
      .eq("plate_id", tokenRow.plate_id);

    if (deleteContactsError) {
      return NextResponse.json(
        { error: `Emergency contact reset failed: ${deleteContactsError.message}` },
        { status: 500 }
      );
    }

    if (emergencyContacts.length > 0) {
      const { error: insertContactsError } = await supabase
        .from("emergency_contacts")
        .insert(emergencyContacts);

      if (insertContactsError) {
        return NextResponse.json(
          { error: `Emergency contact save failed: ${insertContactsError.message}` },
          { status: 500 }
        );
      }
    }

    const { error: tokenUpdateError } = await supabase
      .from("plate_setup_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    if (tokenUpdateError) {
      return NextResponse.json(
        { error: `Token finalisation failed: ${tokenUpdateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      plate_id: tokenRow.plate_id,
      mounting_holes: mountingHoles,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}