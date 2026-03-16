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

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const sb = supabaseAdmin();

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, slug, identifier, contact_enabled")
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

    if (!plate.contact_enabled) {
      return NextResponse.json(
        { error: "Contact is disabled for this plate." },
        { status: 403 },
      );
    }

    const { data: tokenRow, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email, created_at")
      .eq("plate_id", plate.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      return NextResponse.json(
        { error: `Recipient lookup failed: ${tokenError.message}` },
        { status: 500 },
      );
    }

    const recipientEmail = tokenRow?.email ?? null;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No owner email is configured for this plate." },
        { status: 400 },
      );
    }

    const subject = plate.identifier
      ? `Carascan contact message – ${plate.identifier}`
      : `Carascan contact message – ${plate.slug}`;

    const html = `
      <p>You have received a new Carascan contact message.</p>
      <p><strong>Plate:</strong> ${plate.identifier ?? plate.slug}</p>
      <p><strong>Reporter name:</strong> ${reporterName || "Not provided"}</p>
      <p><strong>Reporter phone:</strong> ${reporterPhone || "Not provided"}</p>
      <p><strong>Reporter email:</strong> ${reporterEmail || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    await sendEmail(recipientEmail, subject, html);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact route failed:", error);
    return NextResponse.json(
      { error: "Failed to send contact message." },
      { status: 500 },
    );
  }
}