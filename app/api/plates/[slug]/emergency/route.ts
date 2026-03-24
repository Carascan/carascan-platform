import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").trim();
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

    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const reporterName = String(body?.reporter_name ?? "").trim();
    const reporterPhone = normalizePhone(
      String(body?.reporter_phone ?? "").trim()
    );
    const message = String(body?.message ?? "").trim();

    const sb = supabaseAdmin();

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, identifier, emergency_enabled")
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

    if (!plate.emergency_enabled) {
      return NextResponse.json(
        { error: "Emergency disabled" },
        { status: 400 }
      );
    }

    const { data: tokenRows, error: tokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id);

    if (tokenError) {
      return NextResponse.json(
        { error: `Token email lookup failed: ${tokenError.message}` },
        { status: 500 }
      );
    }

    const { data: contacts, error: contactsError } = await sb
      .from("emergency_contacts")
      .select("phone, email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    if (contactsError) {
      return NextResponse.json(
        { error: `Emergency contact lookup failed: ${contactsError.message}` },
        { status: 500 }
      );
    }

    const emails = Array.from(
      new Set(
        [
          ...(tokenRows ?? []).map((r) => String(r.email ?? "").trim()),
          ...(contacts ?? []).map((c) => String(c.email ?? "").trim()),
        ].filter(Boolean)
      )
    );

    const phones = Array.from(
      new Set(
        (contacts ?? [])
          .map((c) => normalizePhone(String(c.phone ?? "").trim()))
          .filter(Boolean)
      )
    );

    if (!emails.length && !phones.length) {
      return NextResponse.json(
        {
          error:
            "No emergency recipients found. Add at least one enabled emergency contact with a phone or email.",
        },
        { status: 400 }
      );
    }

    const map = buildMapsUrl(lat, lng);

    const emailHtml = `
      <h2>🚨 Emergency Alert</h2>
      <p><strong>Plate:</strong> ${plate.identifier}</p>
      <p><a href="${map}" target="_blank" rel="noopener noreferrer">Open location</a></p>
      <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
      <p><strong>Reporter:</strong> ${reporterName || "Unknown"}</p>
      <p><strong>Phone:</strong> ${reporterPhone || "Unknown"}</p>
      ${message ? `<p><strong>Details:</strong> ${message}</p>` : ""}
    `;

    const sms = `EMERGENCY ${plate.identifier} ${map}`;

    const tasks: Promise<any>[] = [];

    if (emails.length) {
      tasks.push(
        sendEmail(emails, `🚨 Emergency - ${plate.identifier}`, emailHtml)
      );
    }

    if (phones.length) {
      tasks.push(sendSmsMany(phones, sms));
    }

    await Promise.all(tasks);

    return NextResponse.json({
      ok: true,
      email_recipient_count: emails.length,
      sms_recipient_count: phones.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send emergency alert.",
      },
      { status: 500 }
    );
  }
}