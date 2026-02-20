import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const sb = supabaseAdmin();

  const { data: t, error: te } = await sb.from("plate_setup_tokens").select("*").eq("token", token).maybeSingle();
  if (te || !t) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  if (new Date(t.expires_at).getTime() < Date.now()) return NextResponse.json({ error: "Token expired" }, { status: 410 });

  const plateId = t.plate_id;
  const [plate, profile, design, contacts] = await Promise.all([
    sb.from("plates").select("*").eq("id", plateId).maybeSingle(),
    sb.from("plate_profiles").select("*").eq("plate_id", plateId).maybeSingle(),
    sb.from("plate_designs").select("*").eq("plate_id", plateId).maybeSingle(),
    sb.from("emergency_contacts").select("*").eq("plate_id", plateId).order("created_at", { ascending: true })
  ]);

  return NextResponse.json({
    plateId,
    plate: plate.data,
    profile: profile.data,
    design: design.data,
    contacts: contacts.data ?? []
  });
}
