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
      .select("id")
      .eq("plate_id", plate.id)
      .eq("sender_fingerprint", senderFingerprint)
      .gte("created_at", cutoffIso)
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

    const { data: owner, error: ownerLookupError } = await sb
      .from("plate_owners")
      .select("email, phone_1, phone_2")
      .eq("plate_id", plate.id)
      .maybeSingle();

    if (ownerLookupError) {
      return NextResponse.json(
        { error: `Owner lookup failed: ${ownerLookupError.message}` },
        { status: 500 }
      );
    }

    const ownerEmails = owner?.email ? [normalizeEmail(owner.email)] : [];

    const ownerPhones = Array.from(
      new Set(
        [owner?.phone_1, owner?.phone_2]
          .map((p) => normalizePhone(String(p ?? "")))
          .filter(Boolean)
      )
    );

    const preferredChannel = String(
      plate.preferred_contact_channel ?? "email"
    ).toLowerCase();

    const shouldSendEmail =
      preferredChannel === "email" || preferredChannel === "both";
    const shouldSendSms =
      preferredChannel === "sms" || preferredChannel === "both";

    if (!ownerEmails.length && !ownerPhones.length) {
      return NextResponse.json(
        { error: "No contact method configured for this plate." },
        { status: 400 }
      );
    }

    if (shouldSendEmail && !ownerEmails.length && !shouldSendSms) {
      return NextResponse.json(
        { error: "No email configured for this plate." },
        { status: 400 }
      );
    }

    if (shouldSendSms && !ownerPhones.length && !shouldSendEmail) {
      return NextResponse.json(
        { error: "No phone number configured for this plate." },
        { status: 400 }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111827;">
        <h2>👋 Carascan Virtual Doorknock</h2>
        <p><strong>Plate:</strong> ${plate.identifier}</p>
        <p><strong>Name:</strong> ${reporterName || "Not provided"}</p>
        <p><strong>Phone:</strong> ${reporterPhone || "Not provided"}</p>
        <p><strong>Email:</strong> ${reporterEmail || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
        <p>Please remember, response is optional.</p>
      </div>
    `;

    const sms = [
      "CARASCAN VIRTUAL DOORKNOCK",
      `Plate: ${plate.identifier}`,
      reporterName ? `Name: ${reporterName}` : "",
      reporterPhone ? `Phone: ${reporterPhone}` : "",
      reporterEmail ? `Email: ${reporterEmail}` : "",
      message ? `Msg: ${message}` : "",
      "",
      "Please remember, response is optional.",
    ]
      .filter(Boolean)
      .join("\n");

    const tasks: Promise<any>[] = [];

    if (shouldSendEmail && ownerEmails.length) {
      tasks.push(
        sendEmail(
          ownerEmails,
          `👋 Carascan Virtual Doorknock - ${plate.identifier}`,
          emailHtml
        )
      );
    }

    if (shouldSendSms && ownerPhones.length) {
      tasks.push(sendSmsMany(ownerPhones, sms));
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
      email_recipient_count: shouldSendEmail ? ownerEmails.length : 0,
      sms_recipient_count: shouldSendSms ? ownerPhones.length : 0,
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