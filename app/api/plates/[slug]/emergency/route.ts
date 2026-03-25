import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

function normalizePhone(value: string): string {
  const cleaned = String(value ?? "").replace(/[^\d+]/g, "").trim();

  if (!cleaned) return "";

  let normalized = "";

  if (cleaned.startsWith("+")) {
    normalized = cleaned;
  } else if (cleaned.startsWith("04") && cleaned.length === 10) {
    normalized = `+61${cleaned.slice(1)}`;
  } else if (cleaned.startsWith("61") && cleaned.length >= 11) {
    normalized = `+${cleaned}`;
  } else if (cleaned.startsWith("4") && cleaned.length === 9) {
    normalized = `+61${cleaned}`;
  } else {
    return "";
  }

  return /^\+\d{8,15}$/.test(normalized) ? normalized : "";
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

    console.log("[SMS DEBUG][EMERGENCY] request received", {
      slug,
      lat,
      lng,
      reporterName,
      reporterPhone,
      hasMessage: !!message,
    });

    const sb = supabaseAdmin();

    let { data: plate, error: plateError } = await sb
  .from("plates")
  .select("id, identifier, slug, emergency_enabled")
  .eq("identifier", slug.toUpperCase())
  .maybeSingle();

if (!plate) {
  const fallback = await sb
    .from("plates")
    .select("id, identifier, slug, emergency_enabled")
    .eq("slug", slug)
    .maybeSingle();

  plate = fallback.data;
  plateError = fallback.error;
}

    if (plateError) {
      console.error("[SMS DEBUG][EMERGENCY] plate lookup failed", {
        slug,
        error: plateError.message,
      });

      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      console.warn("[SMS DEBUG][EMERGENCY] plate not found", { slug });

      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    if (!plate.emergency_enabled) {
      console.warn("[SMS DEBUG][EMERGENCY] emergency disabled", {
        slug,
        plateId: plate.id,
        identifier: plate.identifier,
      });

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
      console.error("[SMS DEBUG][EMERGENCY] token email lookup failed", {
        plateId: plate.id,
        error: tokenError.message,
      });

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
      console.error("[SMS DEBUG][EMERGENCY] emergency contact lookup failed", {
        plateId: plate.id,
        error: contactsError.message,
      });

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

    const rawPhones = (contacts ?? []).map((c) => String(c.phone ?? "").trim());

    const phones = Array.from(
      new Set(rawPhones.map((value) => normalizePhone(value)).filter(Boolean))
    );

    console.log("[SMS DEBUG][EMERGENCY] recipient build", {
      plateId: plate.id,
      identifier: plate.identifier,
      tokenEmailCount: (tokenRows ?? []).length,
      enabledEmergencyContactCount: (contacts ?? []).length,
      rawPhones,
      normalizedPhones: phones,
      emails,
      emailCount: emails.length,
      smsCount: phones.length,
    });

    if (!emails.length && !phones.length) {
      console.warn("[SMS DEBUG][EMERGENCY] no recipients found", {
        plateId: plate.id,
        identifier: plate.identifier,
        rawPhones,
        contacts,
      });

      return NextResponse.json(
        {
          error:
            "No emergency recipients found. Add at least one enabled emergency contact with a phone or email.",
          email_recipient_count: 0,
          sms_recipient_count: 0,
          debug: {
            plate_id: plate.id,
            identifier: plate.identifier,
            enabled_emergency_contact_count: (contacts ?? []).length,
            raw_phone_values: rawPhones,
            normalized_phone_values: phones,
          },
        },
        { status: 400 }
      );
    }

    const map = buildMapsUrl(lat, lng);

    const emailHtml = `
  <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827;">
    <h2>🚨 Carascan QR Emergency Alert 🚨</h2>
    <p><strong>Plate:</strong> ${plate.identifier}</p>
    <p><strong>Sender name:</strong> ${reporterName || "Not provided"}</p>
    <p><strong>Sender phone:</strong> ${reporterPhone || "Not provided"}</p>
    <p><strong>Location:</strong></p>
    <p>
      <a href="${map}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
    </p>
    ${
      message
        ? `<p><strong>Details:</strong></p><p>${message.replace(/\n/g, "<br />")}</p>`
        : ""
    }
    <p>Your details have been provided as an emergency contact.</p>
    <p>
      <a href="https://www.carascan.com.au" target="_blank" rel="noopener noreferrer">
        www.carascan.com.au
      </a>
    </p>
  </div>
`;
    const smsLines = [
  `🚨CARASCAN QR EMERGENCY ALERT🚨 - ${plate.identifier}`,
  reporterName ? `Name: ${reporterName}` : "",
  reporterPhone ? `Phone: ${reporterPhone}` : "",
  "",
  "Location:",
  map,
  "",
  message ? `Details: ${message}` : "",
  "",
  "Your details have been provided as an emergency contact",
  "",
  "https://www.carascan.com.au",
].filter(Boolean);
const sms = smsLines.join("\n");

    console.log("[SMS DEBUG][EMERGENCY] dispatch starting", {
      plateId: plate.id,
      identifier: plate.identifier,
      emailCount: emails.length,
      smsCount: phones.length,
      phones,
      emails,
    });

    const tasks: Promise<any>[] = [];

    if (emails.length) {
      tasks.push(
        sendEmail(emails, `🚨 Emergency - ${plate.identifier}`, emailHtml)
      );
    }

    if (phones.length) {
      console.log("[SMS DEBUG][EMERGENCY] calling sendSmsMany", {
        smsCount: phones.length,
        phones,
      });

      tasks.push(sendSmsMany(phones, sms));
    }

    await Promise.all(tasks);

    console.log("[SMS DEBUG][EMERGENCY] dispatch complete", {
      plateId: plate.id,
      identifier: plate.identifier,
      emailCount: emails.length,
      smsCount: phones.length,
    });

    return NextResponse.json({
      ok: true,
      email_recipient_count: emails.length,
      sms_recipient_count: phones.length,
      debug: {
        plate_id: plate.id,
        identifier: plate.identifier,
        normalized_phone_values: phones,
      },
    });
  } catch (error) {
    console.error("[SMS DEBUG][EMERGENCY] route failed", { error });

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