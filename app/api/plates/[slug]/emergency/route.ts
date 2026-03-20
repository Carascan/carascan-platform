import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseServer";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildAppleMapsUrl(lat: number, lng: number) {
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}`;
}

function buildStaticMapUrl(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=1200x630&scale=2&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${key}`;
}

function buildEmailHtml(input: {
  identifier: string;
  slug: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  message: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
}) {
  const googleMapsUrl = buildGoogleMapsUrl(input.lat, input.lng);
  const appleMapsUrl = buildAppleMapsUrl(input.lat, input.lng);
  const staticMapUrl = buildStaticMapUrl(input.lat, input.lng);

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.6">
      <h2 style="margin:0 0 16px;color:#b91c1c">Carascan emergency alert</h2>

      <p style="margin:0 0 8px"><strong>Plate:</strong> ${escapeHtml(input.identifier)}</p>
      <p style="margin:0 0 8px"><strong>Public slug:</strong> ${escapeHtml(input.slug)}</p>
      <p style="margin:0 0 8px"><strong>Reporter:</strong> ${escapeHtml(input.reporterName || "Not provided")}</p>
      <p style="margin:0 0 8px"><strong>Phone:</strong> ${escapeHtml(input.reporterPhone || "Not provided")}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(input.reporterEmail || "Not provided")}</p>
      <p style="margin:0 0 8px"><strong>Coordinates:</strong> ${input.lat}, ${input.lng}</p>
      ${
        input.accuracyM != null
          ? `<p style="margin:0 0 16px"><strong>Accuracy:</strong> ${input.accuracyM} m</p>`
          : `<div style="height:8px"></div>`
      }

      <p style="margin:0 0 12px">
        <a href="${googleMapsUrl}" target="_blank" rel="noreferrer" style="display:inline-block;padding:12px 16px;background:#b91c1c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;margin-right:8px">
          Open in Google Maps
        </a>
        <a href="${appleMapsUrl}" target="_blank" rel="noreferrer" style="display:inline-block;padding:12px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700">
          Open in Apple Maps
        </a>
      </p>

      ${
        staticMapUrl
          ? `
        <p style="margin:0 0 16px">
          <a href="${googleMapsUrl}" target="_blank" rel="noreferrer">
            <img
              src="${staticMapUrl}"
              alt="Emergency location map"
              style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #d1d5db;border-radius:12px"
            />
          </a>
        </p>
      `
          : ""
      }

      ${
        input.message
          ? `
        <div style="margin-top:16px;padding:14px;border:1px solid #fecaca;border-radius:12px;background:#fef2f2">
          <div style="font-weight:700;margin-bottom:6px">Emergency details</div>
          <div>${escapeHtml(input.message).replaceAll("\n", "<br/>")}</div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function buildEmailText(input: {
  identifier: string;
  slug: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  message: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
}) {
  const googleMapsUrl = buildGoogleMapsUrl(input.lat, input.lng);
  const appleMapsUrl = buildAppleMapsUrl(input.lat, input.lng);

  return [
    `Carascan emergency alert`,
    ``,
    `Plate: ${input.identifier}`,
    `Public slug: ${input.slug}`,
    `Reporter: ${input.reporterName || "Not provided"}`,
    `Phone: ${input.reporterPhone || "Not provided"}`,
    `Email: ${input.reporterEmail || "Not provided"}`,
    `Coordinates: ${input.lat}, ${input.lng}`,
    input.accuracyM != null ? `Accuracy: ${input.accuracyM} m` : "",
    `Google Maps: ${googleMapsUrl}`,
    `Apple Maps: ${appleMapsUrl}`,
    ``,
    input.message ? `Emergency details:\n${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
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

    const html = buildEmailHtml({
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

    const text = buildEmailText({
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

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Carascan <noreply@carascan.com.au>",
      to: recipients,
      subject: `EMERGENCY ALERT for ${plate.identifier}`,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send emergency alert.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}