import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const body = await req.json();
    const reporterName =
      typeof body?.reporter_name === "string" ? body.reporter_name.trim() : "";
    const reporterPhone =
      typeof body?.reporter_phone === "string" ? body.reporter_phone.trim() : "";
    const reporterEmail =
      typeof body?.reporter_email === "string" ? body.reporter_email.trim() : "";
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const locationText =
      typeof body?.location_text === "string" ? body.location_text.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const sb = supabaseAdmin();

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, slug, identifier, emergency_enabled")
      .eq("slug", slug)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 },
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    if (!plate.emergency_enabled) {
      return NextResponse.json(
        { error: "Emergency is disabled for this plate." },
        { status: 403 },
      );
    }

    const { data: contacts, error: contactsError } = await sb
      .from("emergency_contacts")
      .select("name, email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    if (contactsError) {
      return NextResponse.json(
        { error: `Emergency contacts lookup failed: ${contactsError.message}` },
        { status: 500 },
      );
    }

    const validEmails = (contacts ?? [])
      .map((c) => (typeof c.email === "string" ? c.email.trim() : ""))
      .filter(Boolean);

    if (!validEmails.length) {
      return NextResponse.json(
        { error: "No enabled emergency contact email addresses found." },
        { status: 400 },
      );
    }

    const subject = plate.identifier
      ? `Carascan emergency alert – ${plate.identifier}`
      : `Carascan emergency alert – ${plate.slug}`;

    const html = `
      <p><strong>Emergency alert received via Carascan.</strong></p>
      <p><strong>Plate:</strong> ${plate.identifier ?? plate.slug}</p>
      <p><strong>Reporter name:</strong> ${reporterName || "Not provided"}</p>
      <p><strong>Reporter phone:</strong> ${reporterPhone || "Not provided"}</p>
      <p><strong>Reporter email:</strong> ${reporterEmail || "Not provided"}</p>
      <p><strong>Location:</strong> ${locationText || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    for (const email of validEmails) {
      await sendEmail(email, subject, html);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Emergency route failed:", error);
    return NextResponse.json(
      { error: "Failed to send emergency alert." },
      { status: 500 },
    );
  }
}