import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSms } from "@/lib/notifySms";
import { z } from "zod";

const BodySchema = z.object({
  reporter_name: z.string().optional().nullable(),
  reporter_phone: z.string().optional().nullable(),
  reporter_email: z.string().optional().nullable(),
  message: z.string().min(1).max(2000),
  geo_lat: z.number().optional().nullable(),
  geo_lng: z.number().optional().nullable(),
  geo_accuracy_m: z.number().optional().nullable()
});

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const body = await req.json().catch(()=>null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { data: plate } = await sb.from("plates").select("*").eq("slug", params.slug).maybeSingle();
  if (!plate || plate.status === "disabled") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!plate.emergency_enabled) return NextResponse.json({ error: "Emergency is disabled" }, { status: 403 });

  const { data: profile } = await sb.from("plate_profiles").select("*").eq("plate_id", plate.id).maybeSingle();
  const p = profile?.caravan_name ?? "Caravan";

  const { data: alert, error: ae } = await sb.from("alerts").insert({
    plate_id: plate.id,
    type: "emergency",
    reporter_name: parsed.data.reporter_name ?? null,
    reporter_phone: parsed.data.reporter_phone ?? null,
    reporter_email: parsed.data.reporter_email ?? null,
    message: parsed.data.message,
    geo_lat: parsed.data.geo_lat ?? null,
    geo_lng: parsed.data.geo_lng ?? null,
    geo_accuracy_m: parsed.data.geo_accuracy_m ?? null
  }).select("*").single();

  if (ae || !alert) return NextResponse.json({ error: ae?.message ?? "Failed" }, { status: 500 });

  const { data: contacts } = await sb.from("emergency_contacts").select("*").eq("plate_id", plate.id).eq("enabled", true);
  const maps = (parsed.data.geo_lat && parsed.data.geo_lng) ? `https://maps.google.com/?q=${parsed.data.geo_lat},${parsed.data.geo_lng}` : null;
  const reporter = [parsed.data.reporter_name, parsed.data.reporter_phone, parsed.data.reporter_email].filter(Boolean).join(" • ");

  const subject = `EMERGENCY: ${p}`;
  const emailHtml = `<p><b>EMERGENCY for ${p}</b></p>
    <p>${reporter ? "From: "+reporter : "From: (not provided)"}</p>
    <p>Message: ${parsed.data.message}</p>
    ${maps ? `<p>Location: <a href="${maps}">${maps}</a></p>` : "<p>Location: not provided</p>"}
    <p>Alert ID: ${alert.id}</p>`;

  for (const c of (contacts ?? [])) {
    if (c.email) {
      try {
        await sendEmail(c.email, subject, emailHtml);
        await sb.from("alert_deliveries").insert({ alert_id: alert.id, contact_id: c.id, channel: "email", recipient: c.email, status: "sent", sent_at: new Date().toISOString() });
      } catch (e:any) {
        await sb.from("alert_deliveries").insert({ alert_id: alert.id, contact_id: c.id, channel: "email", recipient: c.email, status: "failed", error_message: e?.message });
      }
    }
    if (c.phone) {
      const sms = `EMERGENCY: ${p}. Msg: ${parsed.data.message}${reporter ? " | From: "+reporter : ""}${maps ? " | "+maps : ""}`;
      try {
        await sendSms(c.phone, sms);
        await sb.from("alert_deliveries").insert({ alert_id: alert.id, contact_id: c.id, channel: "sms", recipient: c.phone, status: "sent", sent_at: new Date().toISOString() });
      } catch (e:any) {
        await sb.from("alert_deliveries").insert({ alert_id: alert.id, contact_id: c.id, channel: "sms", recipient: c.phone, status: "failed", error_message: e?.message });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
