import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

const ContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  relationship: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  enabled: z.boolean(),
});

const BodySchema = z.object({
  token: z.string().min(10),
  caravanName: z.string().min(1).max(120),
  bio: z.string().max(300).optional().nullable(),
  text1: z.string().min(1).max(120),
  text2: z.string().optional().nullable(),
  contactEnabled: z.boolean(),
  emergencyEnabled: z.boolean(),
  preferredChannel: z.enum(["email", "sms"]),
  contacts: z.array(ContactSchema).max(10),
});

export async function POST(req: Request) {
  const sb = supabaseAdmin();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    token,
    caravanName,
    bio,
    text1,
    text2,
    contactEnabled,
    emergencyEnabled,
    preferredChannel,
    contacts,
  } = parsed.data;

  const { data: tokenRow, error: tokenError } = await sb
    .from("plate_setup_tokens")
    .select("plate_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (tokenError) {
    return NextResponse.json(
      { error: tokenError.message },
      { status: 500 }
    );
  }

  if (!tokenRow) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 });
  }

  const plateId = tokenRow.plate_id;

  const cleanedContacts = contacts
    .map((c) => ({
      name: c.name.trim(),
      relationship: c.relationship?.trim() || null,
      phone: c.phone?.trim() || null,
      email: c.email?.trim() || null,
      enabled: c.enabled,
    }))
    .filter((c) => c.name.length > 0);

  const enabledContacts = cleanedContacts.filter((c) => c.enabled);

  if (enabledContacts.length > 10) {
    return NextResponse.json(
      { error: "Too many enabled contacts" },
      { status: 400 }
    );
  }

  const { error: plateError } = await sb
    .from("plates")
    .update({
      contact_enabled: contactEnabled,
      emergency_enabled: emergencyEnabled,
      preferred_contact_channel: preferredChannel,
      status: "active",
    })
    .eq("id", plateId);

  if (plateError) {
    return NextResponse.json(
      { error: `Plate update failed: ${plateError.message}` },
      { status: 500 }
    );
  }

  const { error: profileError } = await sb.from("plate_profiles").upsert({
    plate_id: plateId,
    caravan_name: caravanName.trim(),
    bio: bio?.trim() || null,
  });

  if (profileError) {
    return NextResponse.json(
      { error: `Profile update failed: ${profileError.message}` },
      { status: 500 }
    );
  }

  const { error: designError } = await sb.from("plate_designs").upsert({
    plate_id: plateId,
    text_line_1: text1.trim(),
    text_line_2: text2?.trim() || "",
  });

  if (designError) {
    return NextResponse.json(
      { error: `Design update failed: ${designError.message}` },
      { status: 500 }
    );
  }

  const { error: deleteContactsError } = await sb
    .from("emergency_contacts")
    .delete()
    .eq("plate_id", plateId);

  if (deleteContactsError) {
    return NextResponse.json(
      { error: `Contact reset failed: ${deleteContactsError.message}` },
      { status: 500 }
    );
  }

  if (cleanedContacts.length > 0) {
    const insertRows = cleanedContacts.map((c) => ({
      plate_id: plateId,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      email: c.email,
      enabled: c.enabled,
    }));

    const { error: insertContactsError } = await sb
      .from("emergency_contacts")
      .insert(insertRows);

    if (insertContactsError) {
      return NextResponse.json(
        { error: `Contact insert failed: ${insertContactsError.message}` },
        { status: 500 }
      );
    }
  }

  const { error: orderError } = await sb
    .from("orders")
    .update({ status: "ready_to_engrave" })
    .eq("plate_id", plateId)
    .in("status", ["paid", "awaiting_profile"]);

  if (orderError) {
    return NextResponse.json(
      { error: `Order update failed: ${orderError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}