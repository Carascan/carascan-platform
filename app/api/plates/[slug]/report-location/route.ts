import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

function normalizePhone(value: string) {
  return String(value ?? "").replace(/[^\d+]/g, "").trim();
}

type Mode = "email" | "sms" | "both";

function useEmail(mode: Mode) {
  return mode === "email" || mode === "both";
}

function useSms(mode: Mode) {
  return mode === "sms" || mode === "both";
}

function cleanMode(value: unknown): Mode {
  return value === "sms" || value === "both" ? value : "email";
}

function buildMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildStaticMapUrl(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_STATIC_API_KEY;

  if (!key) return "";

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=640x320&scale=2&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${key}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const reporterName = String(body?.reporter_name ?? "").trim();
    const reporterPhone = normalizePhone(
      String(body?.reporter_phone ?? "").trim()
    );
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
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    let { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, identifier, slug, report_channel")
      .eq("identifier", slug)
      .maybeSingle();

    if (!plate) {
      const fallback = await sb
        .from("plates")
        .select("id, identifier, slug, report_channel")
        .eq("slug", slug)
        .maybeSingle();

      plate = fallback.data;
      plateError = fallback.error;
    }

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    const mode = cleanMode(plate.report_channel);

    const { data: tokenRows, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id);

    if (tokenError) {
      return NextResponse.json(
        { error: `Owner email lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    const { data: ownerRow, error: ownerError } = await sb
      .from("plate_owners")
      .select("phone_1, phone_2")
      .eq("plate_id", plate.id)
      .maybeSingle();

    if (ownerError) {
      return NextResponse.json(
        { error: `Owner phone lookup failed: ${ownerError.message}` },
        { status: 500 }
      );
    }

    const emails = Array.from(
      new Set(
        (tokenRows ?? [])
          .map((row) => String(row.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const phones = Array.from(
      new Set(
        [ownerRow?.phone_1, ownerRow?.phone_2]
          .map((value) => normalizePhone(String(value ?? "").trim()))
          .filter(Boolean)
      )
    );

    const mapUrl = buildMapsUrl(lat, lng);
    const mapImageUrl = buildStaticMapUrl(lat, lng);

    const html = `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">

  <h2 style="margin-bottom: 10px;">📍 Carascan Location Update</h2>

  <p>
    Someone nearby has shared a location linked to your Carascan plate.
  </p>

  <p><strong>Plate:</strong> ${plate.identifier}</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

  <p><strong>Sender details</strong></p>
  <p>Name: ${reporterName || "Not provided"}</p>
  <p>Phone: ${reporterPhone || "Not provided"}</p>
  <p>Email: ${reporterEmail || "Not provided"}</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

  <p><strong>Reported location</strong></p>

  <a href="${mapUrl}" target="_blank">
    <img
      src="${mapImageUrl}"
      alt="Map preview"
      width="640"
      style="display:block;width:100%;max-width:640px;border-radius:10px;"
    />
  </a>

  <p style="margin-top:10px;">
    <a href="${mapUrl}" target="_blank">
      View location in Google Maps
    </a>
  </p>

  ${
    message
      ? `
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
      <p><strong>Message</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `
      : ""
  }

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />

  <p style="font-size: 14px; color: #6b7280;">
    This message was sent via Carascan.<br/>
    Respond only if you choose to — there is no obligation.
  </p>

</div>
`;

    const smsLines = [
      `CARASCAN REPORT LOCATION - ${plate.identifier}`,
      reporterName ? `Name: ${reporterName}` : "",
      reporterPhone ? `Phone: ${reporterPhone}` : "",
      reporterEmail ? `Email: ${reporterEmail}` : "",
      message ? `Msg: ${message}` : "",
      `Map: ${mapUrl}`,
    ].filter(Boolean);

    const smsBody = smsLines.join("\n");

    const tasks: Promise<any>[] = [];

    if (useEmail(mode) && emails.length) {
      tasks.push(
        sendEmail(emails, `Location report - ${plate.identifier}`, html)
      );
    }

    if (useSms(mode) && phones.length) {
      tasks.push(sendSmsMany(phones, smsBody));
    }

    if (!tasks.length) {
      return NextResponse.json(
        {
          error:
            "No recipients found for the selected report delivery mode. Check owner email or owner phone setup.",
        },
        { status: 400 }
      );
    }

    await Promise.all(tasks);

    return NextResponse.json({
      ok: true,
      email_recipient_count: useEmail(mode) ? emails.length : 0,
      sms_recipient_count: useSms(mode) ? phones.length : 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send location report.",
      },
      { status: 500 }
    );
  }
}