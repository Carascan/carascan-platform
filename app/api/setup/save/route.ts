import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { z } from "zod";

const ContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  relationship: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  enabled: z.boolean()
});

const BodySchema = z.object({
  token: z.string().min(10),
  caravanName: z.string().min(1),
  bio: z.string().max(300).optional().nullable(),
  text1: z.string().min(1),
  text2: z.string().optional().nullable(),
  contactEnabled: z.boolean(),
  emergencyEnabled: z.boolean(),
  preferredChannel: z.enum(["email","sms"]),
  contacts: z.array(ContactSchema).max(8)
});

export async function POST(req: Request) {
  const sb = supabaseAdmin();
  const body = await req.json().catch(()=>null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const { token, caravanName, bio, text1, text2, contactEnabled, emergencyEnabled, preferredChannel, contacts } = parsed.data;

  const { data: t } = await sb.from("plate_setup_tokens").select("*").eq("token", token).maybeSingle();
  if (!t) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  if (new Date(t.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Token expired" }, { status: 410 });

  const plateId = t.plate_id;

  await sb.from("plates").update({
    contact_enabled: contactEnabled,
    emergency_enabled: emergencyEnabled,
    preferred_contact_channel: preferredChannel,
    status: "active"
  }).eq("id", plateId);

  await sb.from("plate_profiles").upsert({
    plate_id: plateId,
    caravan_name: caravanName,
    bio: bio ?? null
  });

  await sb.from("plate_designs").upsert({
    plate_id: plateId,
    text_line_1: text1,
    text_line_2: text2 ?? null
  });

  await sb.from("emergency_contacts").delete().eq("plate_id", plateId);
  const insertRows = contacts.filter(c=>c.name.trim().length>0).map(c=>({
    plate_id: plateId, name: c.name.trim(), relationship: c.relationship ?? null, phone: c.phone ?? null, email: c.email ?? null, enabled: c.enabled
  }));
  if (insertRows.length) await sb.from("emergency_contacts").insert(insertRows);

  await sb.from("orders").update({ status: "ready_to_engrave" }).eq("plate_id", plateId).in("status", ["paid","awaiting_profile"]);

  return NextResponse.json({ ok: true });
}
