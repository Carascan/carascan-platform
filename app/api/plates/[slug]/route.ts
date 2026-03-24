import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, identifier, slug, report_channel")
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

    const { data: phoneRows, error: phoneError } = await sb
      .from("emergency_contacts")
      .select("phone, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    if (phoneError) {
      return NextResponse.json(
        { error: `SMS recipient lookup failed: ${phoneError.message}` },
        { status: 500 }
      );
    }

    const emails = Array.from(
      new Set(
        (tokenRows ?? [])
          .map((r) => String(r.email ?? "").trim())
          .filter(Boolean)
      )
    );

    const phones = Array.from(
      new Set(
        (phoneRows ?? [])
          .map((r) => normalizePhone(String(r.phone ?? "").trim()))
          .filter(Boolean)
      )
    );

    const mapUrl = buildMapsUrl(lat, lng);

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 16px 0;">Location report</h2>
        <p style="margin:0 0 8px 0;"><strong>Plate:</strong> ${escapeHtml(
          plate.identifier
        )}</p>
        <p style="margin:0 0 8px 0;">
          <a href="${mapUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
        </p>
        <p style="margin:0 0 8px 0;"><strong>Coordinates:</strong> ${lat}, ${lng}</p>
        ${
          accuracyM != null
            ? `<p style="margin:0 0 8px 0;"><strong>Accuracy:</strong> ${accuracyM}m</p>`
            : ""
        }
        <hr style="margin:20px 0;" />
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${escapeHtml(
          reporterName || "Not provided"
        )}</p>
        <p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${escapeHtml(
          reporterPhone || "Not provided"
        )}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(
          reporterEmail || "Not provided"
        )}</p>
        ${
          message
            ? `<p style="margin:12px 0 0 0;"><strong>Notes:</strong><br/>${escapeHtml(
                message
              ).replace(/\n/g, "<br/>")}</p>`
            : ""
        }
      </div>
    `;

    const smsBody = [
      `CARASCAN LOCATION`,
      `Plate ${plate.identifier}`,
      `Map ${mapUrl}`,
      reporterName ? `From ${reporterName}` : "",
      reporterPhone ? `Phone ${reporterPhone}` : "",
      message ? `Notes ${message}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const tasks: Promise<any>[] = [];

    if (useEmail(mode) && emails.length) {
      tasks.push(sendEmail(emails, `Location report - ${plate.identifier}`, html));
    }

    if (useSms(mode) && phones.length) {
      tasks.push(sendSmsMany(phones, smsBody));
    }

    if (!tasks.length) {
      return NextResponse.json(
        {
          error:
            "No recipients found for the selected report delivery mode. Check email setup or enabled phone contacts.",
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