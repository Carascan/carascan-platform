import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const sb = supabaseAdmin();
  const { data: plate } = await sb.from("plates").select("*").eq("slug", params.slug).maybeSingle();
  if (!plate || plate.status === "disabled") return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await sb.from("plate_profiles").select("*").eq("plate_id", plate.id).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile missing" }, { status: 404 });

  return NextResponse.json({ plate, profile });
}
