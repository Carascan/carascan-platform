import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";

function normalizePhone(v: string) {
  return v.replace(/\s+/g, "");
}

type Mode = "email" | "sms" | "both";

function useEmail(m: Mode) {
  return m === "email" || m === "both";
}

function useSms(m: Mode) {
  return m === "sms" || m === "both";
}

function clean(m: unknown): Mode {
  return m === "sms" || m === "both" ? m : "email";
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const sb = supabaseAdmin();

    const { data: plate } = await sb
      .from("plates")
      .select("id, identifier, preferred_contact_channel")
      .eq("slug", slug)
      .maybeSingle();

    if (!plate) {
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    const mode = clean(plate.preferred_contact_channel);

    const { data: tokenRows } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id);

    const { data: phoneRows } = await sb
      .from("emergency_contacts")
      .select("phone")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    const emails = (tokenRows ?? [])
      .map((r) => r.email)
      .filter(Boolean);

    const phones = (phoneRows ?? [])
      .map((r) => normalizePhone(r.phone))
      .filter(Boolean);

    const msg = body?.message ?? "New contact";

    const tasks: Promise<any>[] = [];

    if (useEmail(mode) && emails.length) {
      tasks.push(sendEmail(emails, "Contact", `<p>${msg}</p>`));
    }

    if (useSms(mode) && phones.length) {
      tasks.push(sendSmsMany(phones, msg));
    }

    await Promise.all(tasks);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}