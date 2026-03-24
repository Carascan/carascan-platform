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

  emergency_contacts?: Array<{
    name?: string;
    phone?: string;
    email?: string;
    enabled?: boolean;
  }>;
};

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
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

    const { data: tokenRow } = await supabase
      .from("plate_setup_tokens")
      .select("token, plate_id, expires_at, used_at, revoked_at")
      .eq("token", token)
      .maybeSingle();

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

    await supabase.from("plate_profiles").upsert(
      {
        plate_id: tokenRow.plate_id,
        caravan_name: caravanName,
        bio,
      },
      { onConflict: "plate_id" }
    );

    await supabase
      .from("plates")
      .update({
        contact_enabled: contactEnabled,
        emergency_enabled: emergencyEnabled,

        // NEW STRUCTURE
        preferred_contact_channel: contactChannel,
        report_channel: reportChannel,

        status: "active",
      })
      .eq("id", tokenRow.plate_id);

    await supabase
      .from("emergency_contacts")
      .delete()
      .eq("plate_id", tokenRow.plate_id);

    if (emergencyContacts.length > 0) {
      await supabase.from("emergency_contacts").insert(emergencyContacts);
    }

    await supabase
      .from("plate_setup_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return NextResponse.json({
      ok: true,
      plate_id: tokenRow.plate_id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}