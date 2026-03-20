import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const BodySchema = z.object({
  reporter_name: z.string().optional().nullable(),
  reporter_phone: z.string().optional().nullable(),
  reporter_email: z.string().optional().nullable(),
  message: z.string().optional().nullable(),

  // 👇 NEW (location support)
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy_m: z.number().optional().nullable(),
  location_source: z.string().optional(),
});

function buildMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const sb = supabaseAdmin();

  try {
    const { slug } = await context.params;
    const rawBody = await req.json().catch(() => null);

    const parsed = BodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const body = parsed.data;

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, slug, identifier, contact_enabled")
      .eq("slug", slug)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    if (!plate.contact_enabled) {
      return NextResponse.json(
        { error: "Contact is disabled for this plate" },
        { status: 403 }
      );
    }

    const { data: tokenRow, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      return NextResponse.json(
        { error: `Recipient lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    const recipientEmail = tokenRow?.email ?? null;

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No owner email configured for this plate" },
        { status: 400 }
      );
    }

    const subject = `Carascan report - ${plate.identifier ?? plate.slug}`;

    // 👇 LOCATION HANDLING
    const hasLocation =
      typeof body.latitude === "number" &&
      typeof body.longitude === "number";

    const mapsLink = hasLocation
      ? buildMapsUrl(body.latitude!, body.longitude!)
      : null;

    const html = `
      <p><strong>Carascan notification</strong></p>

      <p><strong>Plate:</strong> ${plate.identifier ?? plate.slug}</p>

      ${
        hasLocation
          ? `
        <p><strong>Location:</strong></p>
        <p><a href="${mapsLink}" target="_blank">Open in Google Maps</a></p>
        <p>${body.latitude}, ${body.longitude}</p>
        ${
          body.accuracy_m
            ? `<p>Accuracy: ${body.accuracy_m}m</p>`
            : ""
        }
      `
          : ""
      }

      <p><strong>Reporter name:</strong> ${
        body.reporter_name?.trim() || "Not provided"
      }</p>

      <p><strong>Reporter phone:</strong> ${
        body.reporter_phone?.trim() || "Not provided"
      }</p>

      <p><strong>Reporter email:</strong> ${
        body.reporter_email?.trim() || "Not provided"
      }</p>

      ${
        body.message
          ? `<p><strong>Message:</strong><br/>${body.message.replace(
              /\n/g,
              "<br/>"
            )}</p>`
          : ""
      }
    `;

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Carascan <noreply@carascan.com.au>",
      to: [recipientEmail],
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact route failed:", error);

    return NextResponse.json(
      { error: "Failed to send contact message" },
      { status: 500 }
    );
  }
}