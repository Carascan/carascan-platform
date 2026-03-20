// app/api/plates/[slug]/emergency/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmergencyAlertEmail } from "@/lib/notifyEmail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const reporterName = String(body?.reporter_name ?? "").trim();
    const reporterPhone = String(body?.reporter_phone ?? "").trim();
    const reporterEmail = String(body?.reporter_email ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);
    const accuracyM =
      body?.accuracy_m == null || body?.accuracy_m === ""
        ? null
        : Number(body.accuracy_m);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Latitude and longitude are required for emergency alerts." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, identifier, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    const { data: tokenRows, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id)
      .order("expires_at", { ascending: false });

    if (tokenError) {
      return NextResponse.json(
        { error: `Owner email lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    const ownerEmails = Array.from(
      new Set(
        (tokenRows ?? [])
          .map((row) => String(row.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const { data: contacts, error: contactsError } = await sb
      .from("emergency_contacts")
      .select("email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    if (contactsError) {
      return NextResponse.json(
        { error: `Emergency contacts lookup failed: ${contactsError.message}` },
        { status: 500 }
      );
    }

    const emergencyEmails = Array.from(
      new Set(
        (contacts ?? [])
          .map((row) => String(row.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const recipients = Array.from(new Set([...ownerEmails, ...emergencyEmails]));

    if (!recipients.length) {
      return NextResponse.json(
        { error: "No emergency email recipients found for this plate." },
        { status: 404 }
      );
    }

    await sendEmergencyAlertEmail({
      to: recipients,
      identifier: plate.identifier,
      slug: plate.slug,
      reporterName,
      reporterPhone,
      reporterEmail,
      message,
      lat,
      lng,
      accuracyM,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send emergency alert.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}