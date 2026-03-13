import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSms } from "@/lib/notifySms";
import { z } from "zod";

const BodySchema = z.object({
  type: z.enum(["contact", "emergency"]),
  reporter_name: z.string().optional().nullable(),
  reporter_phone: z.string().optional().nullable(),
  reporter_email: z.string().optional().nullable(),
  message: z.string().min(1).max(2000),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      accuracy: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const sb = supabaseAdmin();

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: plate } = await sb
    .from("plates")
    .select(
      "id, slug, status, contact_enabled, emergency_enabled, preferred_contact_channel, owner_user_id"
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (!plate || plate.status === "disabled") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.type === "contact" && !plate.contact_enabled) {
    return NextResponse.json({ error: "Contact is disabled" }, { status: 403 });
  }

  if (parsed.data.type === "emergency" && !plate.emergency_enabled) {
    return NextResponse.json(
      { error: "Emergency alerts are disabled" },
      { status: 403 }
    );
  }

  const { data: profile } = await sb
    .from("plate_profiles")
    .select("caravan_name")
    .eq("plate_id", plate.id)
    .maybeSingle();

  const { data: alert, error: alertError } = await sb
    .from("alerts")
    .insert({
      plate_id: plate.id,
      type: parsed.data.type,
      reporter_name: parsed.data.reporter_name ?? null,
      reporter_phone: parsed.data.reporter_phone ?? null,
      reporter_email: parsed.data.reporter_email ?? null,
      message: parsed.data.message,
      location_lat: parsed.data.location?.lat ?? null,
      location_lng: parsed.data.location?.lng ?? null,
      location_accuracy: parsed.data.location?.accuracy ?? null,
    })
    .select("id")
    .single();

  if (alertError || !alert) {
    return NextResponse.json(
      { error: alertError?.message ?? "Failed" },
      { status: 500 }
    );
  }

  const alertId = alert.id;

  const { data: tokenRow } = await sb
    .from("plate_setup_tokens")
    .select("email")
    .eq("plate_id", plate.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ownerEmail = tokenRow?.email ?? null;

  const subject =
    parsed.data.type === "emergency"
      ? `Carascan EMERGENCY: ${profile?.caravan_name ?? "Caravan"}`
      : `Carascan contact: ${profile?.caravan_name ?? "Caravan"}`;

  const msg = parsed.data.message;

  const reporter = [
    parsed.data.reporter_name,
    parsed.data.reporter_phone,
    parsed.data.reporter_email,
  ]
    .filter(Boolean)
    .join(" • ");

  const locationText = parsed.data.location
    ? `Location: https://maps.google.com/?q=${parsed.data.location.lat},${parsed.data.location.lng}`
    : "";

  const smsMessage = `Carascan ${parsed.data.type}: ${msg}${
    reporter ? " | " + reporter : ""
  }${locationText ? " | " + locationText : ""}`;

  const emailHtml = `<p><b>${profile?.caravan_name ?? "Caravan"}</b></p>
<p>${reporter ? "From: " + reporter : "From: (not provided)"}</p>
<p>${msg}</p>
${locationText ? `<p>${locationText}</p>` : ""}`;

  const sendEmailAllowed =
    plate.preferred_contact_channel === "email" ||
    plate.preferred_contact_channel === "both";

  const sendSmsAllowed =
    plate.preferred_contact_channel === "sms" ||
    plate.preferred_contact_channel === "both";

  let sentSomething = false;

  async function logDelivery(
    channel: "sms" | "email",
    recipient: string,
    status: "sent" | "failed",
    error_message?: string | null
  ) {
    await sb.from("alert_deliveries").insert({
      alert_id: alertId,
      channel,
      recipient,
      status,
      error_message: error_message ?? null,
      sent_at: new Date().toISOString(),
    });
  }

  async function sendSmsSafe(phone: string) {
    try {
      await sendSms(phone, smsMessage);
      await logDelivery("sms", phone, "sent");
      sentSomething = true;
    } catch (e: any) {
      await logDelivery("sms", phone, "failed", e?.message ?? "SMS failed");
    }
  }

  async function sendEmailSafe(email: string) {
    try {
      await sendEmail(email, subject, emailHtml);
      await logDelivery("email", email, "sent");
      sentSomething = true;
    } catch (e: any) {
      await logDelivery("email", email, "failed", e?.message ?? "Email failed");
    }
  }

  if (sendSmsAllowed && plate.owner_user_id) {
    const { data: ownerProfile } = await sb
      .from("user_profiles")
      .select("phone")
      .eq("user_id", plate.owner_user_id)
      .maybeSingle();

    const ownerPhone = ownerProfile?.phone;
    if (ownerPhone) {
      await sendSmsSafe(ownerPhone);
    }
  }

  if (sendEmailAllowed && ownerEmail) {
    await sendEmailSafe(ownerEmail);
  }

  if (parsed.data.type === "emergency") {
    const { data: emergencyContacts } = await sb
      .from("emergency_contacts")
      .select("name, phone, email, enabled")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    for (const contact of emergencyContacts ?? []) {
      if (contact.phone) {
        await sendSmsSafe(contact.phone);
      }
      if (contact.email) {
        await sendEmailSafe(contact.email);
      }
    }
  }

  if (sentSomething) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({
    ok: true,
    note: "No delivery destination was configured.",
  });
}
