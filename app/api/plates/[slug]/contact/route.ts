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
.select("*")
.eq("slug", params.slug)
.maybeSingle();

if (!plate || plate.status === "disabled") {
return NextResponse.json({ error: "Not found" }, { status: 404 });
}

if (parsed.data.type === "contact" && !plate.contact_enabled) {
return NextResponse.json(
{ error: "Contact is disabled" },
{ status: 403 }
);
}

if (parsed.data.type === "emergency" && !plate.emergency_enabled) {
return NextResponse.json(
{ error: "Emergency alerts are disabled" },
{ status: 403 }
);
}

const { data: profile } = await sb
.from("plate_profiles")
.select("*")
.eq("plate_id", plate.id)
.maybeSingle();

const { data: alert, error: ae } = await sb
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
.select("*")
.single();

if (ae || !alert) {
return NextResponse.json(
{ error: ae?.message ?? "Failed" },
{ status: 500 }
);
}

// Owner routing MVP (email from setup token)
const { data: tokenRow } = await sb
.from("plate_setup_tokens")
.select("email")
.eq("plate_id", plate.id)
.order("created_at", { ascending: false })
.limit(1)
.maybeSingle();

const ownerEmail = tokenRow?.email;

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

const fullMessage = `
${msg}

${reporter ? "From: " + reporter : ""}
${locationText}
`;

if (plate.preferred_contact_channel === "sms") {
const { data: ownerProfile } = await sb
.from("user_profiles")
.select("phone")
.eq("user_id", plate.owner_user_id)
.maybeSingle();

```
const ownerPhone = ownerProfile?.phone;

if (ownerPhone) {
  await sendSms(
    ownerPhone,
    `Carascan ${parsed.data.type}: ${msg}${
      reporter ? " | " + reporter : ""
    }`
  );

  await sb.from("alert_deliveries").insert({
    alert_id: alert.id,
    channel: "sms",
    recipient: ownerPhone,
    status: "sent",
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
```

}

if (ownerEmail) {
await sendEmail(
ownerEmail,
subject,
`<p><b>${profile?.caravan_name ?? "Caravan"}</b></p>        <p>${reporter ? "From: " + reporter : "From: (not provided)"}</p>        <p>${msg}</p>
       ${locationText ? `<p>${locationText}</p>` : ""}`
);

```
await sb.from("alert_deliveries").insert({
  alert_id: alert.id,
  channel: "email",
  recipient: ownerEmail,
  status: "sent",
  sent_at: new Date().toISOString(),
});

return NextResponse.json({ ok: true });
```

}

return NextResponse.json({
ok: true,
note: "Owner routing not configured yet.",
});
}
