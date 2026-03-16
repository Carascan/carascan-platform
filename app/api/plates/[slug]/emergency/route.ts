import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSms } from "@/lib/notifySms";
import { z } from "zod";

const BodySchema = z.object({
  reporter_name: z.string().optional().nullable(),
  reporter_phone: z.string().optional().nullable(),
  reporter_email: z.string().optional().nullable(),
  message: z.string().min(1).max(2000),
  geo_lat: z.number().optional().nullable(),
  geo_lng: z.number().optional().nullable(),
  geo_accuracy_m: z.number().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const sb = supabaseAdmin();

  try {
    const { slug } = await context.params;
    const rawBody = await req.json().catch(() => null);

    const parsed = BodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const body = parsed.data;

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select(
        "id, slug, identifier, emergency_enabled, preferred_contact_channel",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 },
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    if (!plate.emergency_enabled) {
      return NextResponse.json(
        { error: "Emergency is disabled for this plate" },
        { status: 403 },
      );
    }

    const { data: contacts, error: contactsError } = await sb
      .from("emergency_contacts")
      .select("id, name, phone, email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    if (contactsError) {
      return NextResponse.json(
        { error: `Emergency contacts lookup failed: ${contactsError.message}` },
        { status: 500 },
      );
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json(
        { error: "No enabled emergency contacts found" },
        { status: 400 },
      );
    }

    const subject = plate.identifier
      ? `Carascan emergency alert - ${plate.identifier}`
      : `Carascan emergency alert - ${plate.slug}`;

    const locationSummary =
      body.geo_lat != null && body.geo_lng != null
        ? `Latitude: ${body.geo_lat}, Longitude: ${body.geo_lng}${
            body.geo_accuracy_m != null
              ? `, Accuracy: ${body.geo_accuracy_m}m`
              : ""
          }`
        : "Not provided";

    const html = `
      <p><strong>Emergency alert received via Carascan.</strong></p>
      <p><strong>Plate:</strong> ${plate.identifier ?? plate.slug}</p>
      <p><strong>Reporter name:</strong> ${body.reporter_name?.trim() || "Not provided"}</p>
      <p><strong>Reporter phone:</strong> ${body.reporter_phone?.trim() || "Not provided"}</p>
      <p><strong>Reporter email:</strong> ${body.reporter_email?.trim() || "Not provided"}</p>
      <p><strong>Location:</strong> ${locationSummary}</p>
      <p><strong>Message:</strong></p>
      <p>${body.message.replace(/\n/g, "<br />")}</p>
    `;

    const smsText = [
      "Carascan emergency alert",
      `Plate: ${plate.identifier ?? plate.slug}`,
      `Reporter: ${body.reporter_name?.trim() || "Unknown"}`,
      `Phone: ${body.reporter_phone?.trim() || "Not provided"}`,
      `Message: ${body.message}`,
      `Location: ${locationSummary}`,
    ].join("\n");

    const preferredChannel =
      plate.preferred_contact_channel === "sms" ||
      plate.preferred_contact_channel === "both"
        ? plate.preferred_contact_channel
        : "email";

    for (const contact of contacts) {
      if (
        (preferredChannel === "email" || preferredChannel === "both") &&
        contact.email
      ) {
        await sendEmail(contact.email, subject, html);
      }

      if (
        (preferredChannel === "sms" || preferredChannel === "both") &&
        contact.phone
      ) {
        await sendSms(contact.phone, smsText);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Emergency route failed:", error);

    return NextResponse.json(
      { error: "Failed to send emergency alert" },
      { status: 500 },
    );
  }
}