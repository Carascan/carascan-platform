import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

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

    const { data: tokenRows } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id);

    const ownerEmails = Array.from(
      new Set(
        (tokenRows ?? [])
          .map((r) => String(r.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const { data: contacts } = await sb
      .from("emergency_contacts")
      .select("email")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    const emergencyEmails = Array.from(
      new Set(
        (contacts ?? [])
          .map((r) => String(r.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const recipients = Array.from(
      new Set([...ownerEmails, ...emergencyEmails])
    );

    if (!recipients.length) {
      return NextResponse.json(
        { error: "No recipients found." },
        { status: 404 }
      );
    }

    const mapsUrl = buildMapsUrl(lat, lng);

    const html = `
      <h2 style="color:#dc2626;">EMERGENCY ALERT</h2>

      <p><strong>Plate:</strong> ${plate.identifier}</p>

      <p>
        <a href="${mapsUrl}" target="_blank">
          Open location in Google Maps
        </a>
      </p>

      <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
      ${accuracyM ? `<p><strong>Accuracy:</strong> ${accuracyM}m</p>` : ""}

      <hr/>

      <p><strong>Reporter:</strong> ${
        reporterName || "Not provided"
      }</p>

      <p><strong>Phone:</strong> ${
        reporterPhone || "Not provided"
      }</p>

      <p><strong>Email:</strong> ${
        reporterEmail || "Not provided"
      }</p>

      ${
        message
          ? `<p><strong>Details:</strong><br/>${message.replace(
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
      to: recipients,
      subject: `🚨 EMERGENCY - ${plate.identifier}`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send emergency alert.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}