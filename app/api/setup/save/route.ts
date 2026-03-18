import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

type SetupSaveBody = {
  token?: string;
  caravan_name?: string;
  bio?: string | null;
  contact_enabled?: boolean;
  emergency_enabled?: boolean;
  preferred_contact_channel?: "email" | "sms" | "both" | string;
  emergency_contacts?: Array<{
    name?: string;
    phone?: string;
    email?: string;
    enabled?: boolean;
  }>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SetupSaveBody;
    const supabase = supabaseAdmin();

    const token = typeof body.token === "string" ? body.token.trim() : "";

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from("plate_setup_tokens")
      .select("token, plate_id, expires_at, used_at, revoked_at")
      .eq("token", token)
      .maybeSingle();

    if (tokenError) {
      return NextResponse.json(
        { error: `Token lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    if (!tokenRow) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (tokenRow.revoked_at) {
      return NextResponse.json(
        { error: "Token has been revoked" },
        { status: 400 }
      );
    }

    if (tokenRow.used_at) {
      return NextResponse.json(
        { error: "Token has already been used" },
        { status: 400 }
      );
    }

    if (
      tokenRow.expires_at &&
      new Date(tokenRow.expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    const caravanName =
      typeof body.caravan_name === "string" ? body.caravan_name.trim() : "";

    const bio =
      typeof body.bio === "string" && body.bio.trim() !== ""
        ? body.bio.trim()
        : null;

    const contactEnabled = body.contact_enabled !== false;
    const emergencyEnabled = body.emergency_enabled !== false;

    const preferredContactChannel =
      body.preferred_contact_channel === "sms" ||
      body.preferred_contact_channel === "both"
        ? body.preferred_contact_channel
        : "email";

    const emergencyContacts = Array.isArray(body.emergency_contacts)
      ? body.emergency_contacts
          .slice(0, 3)
          .map((contact) => ({
            plate_id: tokenRow.plate_id,
            name: typeof contact?.name === "string" ? contact.name.trim() : "",
            phone:
              typeof contact?.phone === "string" ? contact.phone.trim() : "",
            email:
              typeof contact?.email === "string" ? contact.email.trim() : "",
            enabled: contact?.enabled !== false,
          }))
          .filter((contact) => contact.name || contact.phone || contact.email)
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
        { error: `Profile update failed: ${profileError.message}` },
        { status: 400 }
      );
    }

    const { error: plateError } = await supabase
      .from("plates")
      .update({
        contact_enabled: contactEnabled,
        emergency_enabled: emergencyEnabled,
        preferred_contact_channel: preferredContactChannel,
        status: "active",
      })
      .eq("id", tokenRow.plate_id);

    if (plateError) {
      return NextResponse.json(
        { error: `Plate update failed: ${plateError.message}` },
        { status: 400 }
      );
    }

    const { error: deleteContactsError } = await supabase
      .from("emergency_contacts")
      .delete()
      .eq("plate_id", tokenRow.plate_id);

    if (deleteContactsError) {
      return NextResponse.json(
        {
          error: `Emergency contacts reset failed: ${deleteContactsError.message}`,
        },
        { status: 400 }
      );
    }

    if (emergencyContacts.length > 0) {
      const { error: contactsError } = await supabase
        .from("emergency_contacts")
        .insert(emergencyContacts);

      if (contactsError) {
        return NextResponse.json(
          {
            error: `Emergency contacts update failed: ${contactsError.message}`,
          },
          { status: 400 }
        );
      }
    }

    const { error: tokenUseError } = await supabase
      .from("plate_setup_tokens")
      .update({
        used_at: new Date().toISOString(),
      })
      .eq("token", token);

    if (tokenUseError) {
      return NextResponse.json(
        { error: `Token finalisation failed: ${tokenUseError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      plate_id: tokenRow.plate_id,
      status: "active",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}