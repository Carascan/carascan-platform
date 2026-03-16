import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

type IncomingContact = {
  id?: string;
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  enabled?: boolean;
};

type SavePayload = {
  token?: string;
  caravanName?: string | null;
  text1?: string;
  text2?: string;
  bio?: string | null;
  contactEnabled?: boolean;
  emergencyEnabled?: boolean;
  preferredChannel?: "email" | "sms" | "both";
  contacts?: IncomingContact[];
};

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNullableString(value: unknown): string | null {
  const s = cleanString(value);
  return s ? s : null;
}

export async function POST(req: Request) {
  let body: SavePayload;

  try {
    body = (await req.json()) as SavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = cleanString(body.token);
  const caravanName = cleanNullableString(body.caravanName);
  const text1 = cleanString(body.text1);
  const text2 = cleanString(body.text2);
  const bio = cleanNullableString(body.bio);
  const contactEnabled = body.contactEnabled !== false;
  const emergencyEnabled = body.emergencyEnabled !== false;
  const preferredChannel =
    body.preferredChannel === "sms" || body.preferredChannel === "both"
      ? body.preferredChannel
      : "email";

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
    return NextResponse.json({ error: "Token has been revoked" }, { status: 410 });
  }

  if (tokenRow.used_at) {
    return NextResponse.json(
      { error: "This setup link has already been used" },
      { status: 410 },
    );
  }

  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  const plateId = tokenRow.plate_id;

  const cleanedContacts = Array.isArray(body.contacts)
    ? body.contacts
        .map((c) => ({
          name: cleanString(c.name),
          relationship: cleanNullableString(c.relationship),
          phone: cleanNullableString(c.phone),
          email: cleanNullableString(c.email),
          enabled: c.enabled !== false,
        }))
        .filter((c) => c.name || c.phone || c.email)
        .slice(0, 3)
    : [];

  const { data: plateRow, error: plateError } = await sb
    .from("plates")
    .select("id, identifier")
    .eq("id", plateId)
    .maybeSingle();

  if (plateError) {
    return NextResponse.json(
      { error: `Plate lookup failed: ${plateError.message}` },
      { status: 500 },
    );
  }

  if (!plateRow) {
    return NextResponse.json({ error: "Plate not found" }, { status: 404 });
  }

  const { error: profileUpdateError } = await sb
    .from("plate_profiles")
    .update({
      caravan_name: caravanName,
      bio,
    })
    .eq("plate_id", plateId);

  if (profileUpdateError) {
    return NextResponse.json(
      { error: `Profile update failed: ${profileUpdateError.message}` },
      { status: 500 },
    );
  }

  const { error: plateUpdateError } = await sb
    .from("plates")
    .update({
      contact_enabled: contactEnabled,
      emergency_enabled: emergencyEnabled,
      preferred_contact_channel: preferredChannel,
      status: "active",
    })
    .eq("id", plateId);

  if (plateUpdateError) {
    return NextResponse.json(
      { error: `Plate update failed: ${plateUpdateError.message}` },
      { status: 500 },
    );
  }

  const { error: designUpdateError } = await sb
    .from("plate_designs")
    .update({
      text_line_1: text1 || "",
      text_line_2: text2 || "",
      proof_approved: true,
    })
    .eq("plate_id", plateId);

  if (designUpdateError) {
    return NextResponse.json(
      { error: `Design update failed: ${designUpdateError.message}` },
      { status: 500 },
    );
  }

  const { error: deleteContactsError } = await sb
    .from("emergency_contacts")
    .delete()
    .eq("plate_id", plateId);

  if (deleteContactsError) {
    return NextResponse.json(
      { error: `Contact reset failed: ${deleteContactsError.message}` },
      { status: 500 },
    );
  }

  if (cleanedContacts.length > 0) {
    const rows = cleanedContacts.map((c) => ({
      plate_id: plateId,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email,
      enabled: c.enabled,
    }));

    const { error: insertContactsError } = await sb
      .from("emergency_contacts")
      .insert(rows);

    if (insertContactsError) {
      return NextResponse.json(
        { error: `Contacts save failed: ${insertContactsError.message}` },
        { status: 500 },
      );
    }
  }

  const { error: tokenUsedError } = await sb
    .from("plate_setup_tokens")
    .update({
      used_at: new Date().toISOString(),
    })
    .eq("token", token);

  if (tokenUsedError) {
    return NextResponse.json(
      { error: `Token finalisation failed: ${tokenUsedError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    plateId,
    identifier: plateRow.identifier ?? null,
    status: "active",
    savedContacts: cleanedContacts.length,
  });
}