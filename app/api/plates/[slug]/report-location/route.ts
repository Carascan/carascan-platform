import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";

function buildGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildStaticMapUrl(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return null;

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "15",
    size: "600x300",
    scale: "1",
    maptype: "roadmap",
    format: "png",
    key,
  });

  params.append("markers", `color:red|${lat},${lng}`);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
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
    const locationSource = String(body?.location_source ?? "device").trim();
    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);
    const accuracyM =
      body?.accuracy_m == null || body?.accuracy_m === ""
        ? null
        : Number(body.accuracy_m);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
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

    const { data: tokenRow, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      return NextResponse.json(
        { error: `Owner email lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    const ownerEmail = String(tokenRow?.email ?? "").trim();

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "Owner email not found for this plate." },
        { status: 404 }
      );
    }

    const mapsUrl = buildGoogleMapsUrl(lat, lng);
    const staticMapUrl = buildStaticMapUrl(lat, lng);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 16px 0;">Location Report</h2>

        <p style="margin:0 0 10px 0;"><strong>Plate:</strong> ${plate.identifier}</p>

        ${
          staticMapUrl
            ? `
          <p style="margin:0 0 14px 0;">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
              <img
                src="${staticMapUrl}"
                alt="Reported location map"
                width="600"
                border="0"
                style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #d1d5db;border-radius:10px;"
              />
            </a>
          </p>
        `
            : ""
        }

        <p style="margin:0 0 12px 0;">
          <a
            href="${mapsUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;"
          >
            Open in Google Maps
          </a>
        </p>

        <p style="margin:0 0 8px 0;"><strong>Coordinates:</strong> ${lat}, ${lng}</p>
        ${
          accuracyM != null
            ? `<p style="margin:0 0 8px 0;"><strong>Accuracy:</strong> ${accuracyM}m</p>`
            : ""
        }
        <p style="margin:0 0 16px 0;"><strong>Location source:</strong> ${locationSource}</p>

        <hr style="margin:20px 0;" />

        <p style="margin:0 0 8px 0;"><strong>Reporter:</strong> ${reporterName || "Not provided"}</p>
        <p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${reporterPhone || "Not provided"}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${reporterEmail || "Not provided"}</p>

        ${
          message
            ? `<p style="margin:12px 0 0 0;"><strong>Notes:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`
            : ""
        }

        <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;word-break:break-all;">
          Direct link:<br />
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">
            ${mapsUrl}
          </a>
        </p>
      </div>
    `;

    await sendEmail([ownerEmail], `Location report - ${plate.identifier}`, html);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send location report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}