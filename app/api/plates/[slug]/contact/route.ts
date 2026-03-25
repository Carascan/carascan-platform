import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

const CONTACT_WINDOW_MINUTES = 10;
const CONTACT_MESSAGE_MAX = 500;

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

function normalizeEmail(value: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function cleanText(value: string, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const realIp = req.headers.get("x-real-ip") ?? "";

  const firstForwardedIp = forwardedFor
    .split(",")
    .map((value) => value.trim())
    .find(Boolean);

  return firstForwardedIp || realIp || "unknown";
}

function makeFingerprint(input: {
  key: string;
  ip: string;
  name: string;
  phone: string;
  email: string;
}) {
  const base = [
    input.key.trim().toLowerCase(),
    input.ip.trim().toLowerCase(),
    input.name.trim().toLowerCase(),
    input.phone.trim().toLowerCase(),
    input.email.trim().toLowerCase(),
  ].join("|");

  return createHash("sha256").update(base).digest("hex");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const reporterName = cleanText(body?.reporter_name, 120);
    const reporterPhone = normalizePhone(String(body?.reporter_phone ?? ""));
    const reporterEmail = normalizeEmail(body?.reporter_email);
    const message = cleanText(body?.message, CONTACT_MESSAGE_MAX);

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!reporterName && !reporterPhone && !reporterEmail) {
      return NextResponse.json(
        {
          error:
            "Provide at least one contact detail: your name, phone, or email.",
        },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const input = String(slug ?? "").trim();

    let { data: plate, error: plateError } = await sb
      .from("plates")
      .select(
        "id, identifier, slug, contact_enabled, preferred_contact_channel"
      )
      .eq("identifier", input.toUpperCase())
      .maybeSingle();

    if (!plate) {
      const fallback = await sb
        .from("plates")
        .select(
          "id, identifier, slug, contact_enabled, preferred_contact_channel"
        )
        .eq("slug", input)
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

    if (!plate.contact_enabled) {
      return NextResponse.json(
        { error: "Contact is disabled for this plate." },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const senderFingerprint = makeFingerprint({
      key: plate.slug ?? input,
      ip,
      name: reporterName,
      phone: reporterPhone,
      email: reporterEmail,
    });

    const cutoffIso = new Date(
      Date.now() - CONTACT_WINDOW_MINUTES * 60 * 1000
    ).toISOString();

    const { data: recentAttempt, error: recentAttemptError } = await sb
      .from("plate_contact_attempts")
      .select("id, created_at")
      .eq("plate_id", plate.id)
      .eq("sender_fingerprint", senderFingerprint)
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentAttemptError) {
      return NextResponse.json(
        {
          error: `Contact cooldown lookup failed: ${recentAttemptError.message}`,
        },
        { status: 500 }
      );
    }

    if (recentAttempt) {
      return NextResponse.json(
        {
          error:
            "A contact message was already sent recently. Please wait 10 minutes before sending another.",
        },
        { status: 429 }
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
        { error: `Contact recipient lookup failed: ${contactsError.message}` },
        { status: 500 }
      );
    }

    const preferredChannel = String(
      plate.preferred_contact_channel ?? "email"
    ).toLowerCase();

    const emails = Array.from(
      new Set(
        [
          ...(tokenRows ?? []).map((r) => normalizeEmail(r.email)),
          ...(contacts ?? []).map((c) => normalizeEmail(c.email)),
        ].filter(Boolean)
      )
    );

    const phones = Array.from(
      new Set(
        (contacts ?? [])
          .map((c) => normalizePhone(String(c.phone ?? "")))
          .filter(Boolean)
      )
    );

    const shouldSendEmail =
      preferredChannel === "email" || preferredChannel === "both";
    const shouldSendSms =
      preferredChannel === "sms" || preferredChannel === "both";

    if (shouldSendEmail && !emails.length && shouldSendSms && !phones.length) {
      return NextResponse.json(
        {
          error:
            "No contact recipients found for the selected contact channel.",
        },
        { status: 400 }
      );
    }

    if (shouldSendEmail && !emails.length && !shouldSendSms) {
      return NextResponse.json(
        {
          error:
            "No email recipients found for the selected contact channel.",
        },
        { status: 400 }
      );
    }

    if (shouldSendSms && !phones.length && !shouldSendEmail) {
      return NextResponse.json(
        {
          error: "No SMS recipients found for the selected contact channel.",
        },
        { status: 400 }
      );
    }

    const emailHtml = `
      <h2>👋 New Contact Request</h2>
      <p><strong>Plate:</strong> ${plate.identifier}</p>
      <p><strong>Sender name:</strong> ${reporterName || "Not provided"}</p>
      <p><strong>Sender phone:</strong> ${reporterPhone || "Not provided"}</p>
      <p><strong>Sender email:</strong> ${reporterEmail || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `;

    const smsLines = [
      `CONTACT ${plate.identifier}`,
      reporterName ? `Name: ${reporterName}` : "",
      reporterPhone ? `Phone: ${reporterPhone}` : "",
      reporterEmail ? `Email: ${reporterEmail}` : "",
      `Msg: ${message}`,
    ].filter(Boolean);

    const sms = smsLines.join("\n");

    const tasks: Promise<any>[] = [];

    if (shouldSendEmail && emails.length) {
      tasks.push(
        sendEmail(emails, `👋 Contact - ${plate.identifier}`, emailHtml)
      );
    }

    if (shouldSendSms && phones.length) {
      tasks.push(sendSmsMany(phones, sms));
    }

    await Promise.all(tasks);

    const { error: insertAttemptError } = await sb
      .from("plate_contact_attempts")
      .insert({
        plate_id: plate.id,
        slug: plate.slug,
        sender_fingerprint: senderFingerprint,
        sender_name: reporterName || null,
        sender_phone: reporterPhone || null,
        sender_email: reporterEmail || null,
        message,
      });

    if (insertAttemptError) {
      return NextResponse.json(
        {
          error: `Contact sent, but cooldown record failed: ${insertAttemptError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      email_recipient_count: shouldSendEmail ? emails.length : 0,
      sms_recipient_count: shouldSendSms ? phones.length : 0,
      cooldown_minutes: CONTACT_WINDOW_MINUTES,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send contact request.",
      },
      { status: 500 }
    );
  }
}