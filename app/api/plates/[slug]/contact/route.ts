import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSms } from "@/lib/notifySms";
import { z } from "zod";

const BodySchema = z.object({
  reporter_name: z.string().optional().nullable(),
  reporter_phone: z.string().optional().nullable(),
  reporter_email: z.string().optional().nullable(),
  message: z.string().min(1).max(2000)
});

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const body = await req.json().catch(()=>null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { data: plate } = await sb.from("plates").select("*").eq("slug", params.slug).maybeSingle();
  if (!plate || plate.status === "disabled") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!plate.contact_enabled) return NextResponse.json({ error: "Contact is disabled" }, { status: 403 });

  const { data: profile } = await sb.from("plate_profiles").select("*").eq("plate_id", plate.id).maybeSingle();

  const { data: alert, error: ae } = await sb.from("alerts").insert({
    plate_id: plate.id,
    type: "contact",
    reporter_name: parsed.data.reporter_name ?? null,
    reporter_phone: parsed.data.reporter_phone ?? null,
    reporter_email: parsed.data.reporter_email ?? null,
    message: parsed.data.message
  }).select("*").single();

  if (ae || !alert) return NextResponse.json({ error: ae?.message ?? "Failed" }, { status: 500 });

  // Owner routing MVP: use email captured at checkout (plate_setup_tokens.email)
  const { data: tokenRow } = await sb.from("plate_setup_tokens").select("email").eq("plate_id", plate.id).order("created_at", { ascending:false }).limit(1).maybeSingle();
  const ownerEmail = tokenRow?.email;

  const subject = `Carascan contact: ${profile?.caravan_name ?? "Caravan"}`;
  const msg = parsed.data.message;
  const reporter = [parsed.data.reporter_name, parsed.data.reporter_phone, parsed.data.reporter_email].filter(Boolean).join(" • ");

  if (plate.preferred_contact_channel === "sms") {
    // Owner phone not stored in MVP unless you populate user_profiles.phone
    const { data: ownerProfile } = await sb.from("user_profiles").select("phone").eq("user_id", plate.owner_user_id).maybeSingle();
    const ownerPhone = ownerProfile?.phone;
    if (ownerPhone) {
      await sendSms(ownerPhone, `Carascan contact (${profile?.caravan_name ?? "Caravan"}): ${msg}${reporter ? " | From: "+reporter : ""}`);
      await sb.from("alert_deliveries").insert({ alert_id: alert.id, channel: "sms", recipient: ownerPhone, status: "sent", sent_at: new Date().toISOString() });
      return NextResponse.json({ ok: true });
    }
  }

  if (ownerEmail) {
    await sendEmail(ownerEmail, subject, `<p><b>${profile?.caravan_name ?? "Caravan"}</b></p><p>${reporter ? "From: "+reporter : "From: (not provided)"}</p><p>${msg}</p>`);
    await sb.from("alert_deliveries").insert({ alert_id: alert.id, channel: "email", recipient: ownerEmail, status: "sent", sent_at: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, note: "Owner routing not configured yet." });
}
