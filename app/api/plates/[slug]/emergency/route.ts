import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { sendEmail } from "@/lib/notifyEmail";
import { sendSmsMany } from "@/lib/notifySms";
import { ENV } from "@/lib/env";

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

function buildMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const lat = Number(body?.latitude);
    const lng = Number(body?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const reporterName = String(body?.reporter_name ?? "").trim();
    const reporterPhone = normalizePhone(
      String(body?.reporter_phone ?? "").trim()
    );
    const message = String(body?.message ?? "").trim();

    const sb = supabaseAdmin();

    const { data: plate } = await sb
      .from("plates")
      .select("id, identifier, emergency_enabled")
      .eq("slug", slug)
      .maybeSingle();

    if (!plate) {
      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    if (!plate.emergency_enabled) {
      return NextResponse.json(
        { error: "Emergency disabled" },
        { status: 400 }
      );
    }

    const { data: tokenRows } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id);

    const { data: contacts } = await sb
      .from("emergency_contacts")
      .select("phone, email")
      .eq("plate_id", plate.id)
      .eq("enabled", true);

    const emails = Array.from(
      new Set([
        ...(tokenRows ?? []).map((r) => r.email),
        ...(contacts ?? []).map((c) => c.email),
      ])
    ).filter(Boolean);

    const phones = Array.from(
      new Set(
        (contacts ?? [])
          .map((c) => normalizePhone(c.phone ?? ""))
          .filter(Boolean)
      )
    );

    const map = buildMapsUrl(lat, lng);

    const emailHtml = `
      <h2>🚨 Emergency Alert</h2>
      <p><strong>Plate:</strong> ${plate.identifier}</p>
      <p><a href="${map}" target="_blank">Open location</a></p>
      <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
      <p><strong>Reporter:</strong> ${reporterName || "Unknown"}</p>
      <p><strong>Phone:</strong> ${reporterPhone || "Unknown"}</p>
      ${message ? `<p><strong>Details:</strong> ${message}</p>` : ""}
    `;

    const sms = `EMERGENCY ${plate.identifier} ${map}`;

    const tasks: Promise<any>[] = [];

    if (emails.length) {
      tasks.push(
        sendEmail(emails, `🚨 Emergency - ${plate.identifier}`, emailHtml)
      );
    }

    if (phones.length) {
      tasks.push(sendSmsMany(phones, sms));
    }

    await Promise.all(tasks);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send emergency alert." },
      { status: 500 }
    );
  }
}