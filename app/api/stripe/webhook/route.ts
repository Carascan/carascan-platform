import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngBuffer } from "@/lib/qr";
import { sendEmail } from "@/lib/notifyEmail";

function randSlug(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}
function randToken(len = 48) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i=0;i<len;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const sb = supabaseAdmin();
  const sig = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  if (!sig || !secret) return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });

  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const email = session.customer_details?.email as string | undefined;
    const shipping = session.shipping_details?.address;

    let slug = randSlug(10);
    for (let i=0;i<5;i++) {
      const { data: existing } = await sb.from("plates").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = randSlug(10);
    }

    const { data: plate, error: plateErr } = await sb.from("plates").insert({
      slug,
      status: "draft",
      contact_enabled: true,
      emergency_enabled: true,
      preferred_contact_channel: "email",
      sku: "CARASCAN_60x90",
    }).select("*").single();

    if (plateErr || !plate) return NextResponse.json({ error: plateErr?.message ?? "Plate insert failed" }, { status: 500 });

    const baseUrl = process.env.APP_BASE_URL!;
    const plateUrl = `${baseUrl}/p/${slug}`;

    const png = await makeQrPngBuffer(plateUrl);
    const filePath = `${slug}.png`;
    const up = await sb.storage.from("qr").upload(filePath, png, { contentType: "image/png", upsert: true });
    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });
    const { data: pub } = sb.storage.from("qr").getPublicUrl(filePath);

    await sb.from("plate_profiles").insert({ plate_id: plate.id, caravan_name: "Caravan", bio: null, owner_photo_url: null });
    await sb.from("plate_designs").insert({
      plate_id: plate.id,
      text_line_1: "Caravan",
      text_line_2: null,
      logo_url: null,
      qr_url: pub.publicUrl,
      proof_approved: false,
      plate_width_mm: 60,
      plate_height_mm: 90,
      qr_size_mm: 40,
      hole_diameter_mm: 4.2
    });

    await sb.from("orders").insert({
      plate_id: plate.id,
      status: "paid",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      amount_total_cents: session.amount_total,
      currency: session.currency,
      shipping_name: session.shipping_details?.name,
      shipping_line1: shipping?.line1,
      shipping_line2: shipping?.line2,
      shipping_city: shipping?.city,
      shipping_state: shipping?.state,
      shipping_postcode: shipping?.postal_code,
      shipping_country: shipping?.country,
    });

    const token = randToken(48);
    const expires = new Date(Date.now() + 1000*60*60*24*14).toISOString();
    await sb.from("plate_setup_tokens").insert({ token, plate_id: plate.id, email: email ?? null, expires_at: expires });

    if (email) {
      const setupUrl = `${baseUrl}/setup/${token}`;
      await sendEmail(
        email,
        "Carascan: set up your plate",
        `<p>Thanks for your Carascan purchase.</p>
         <p>Set up your plate page and emergency contacts here:</p>
         <p><a href="${setupUrl}">${setupUrl}</a></p>
         <p>Public plate link (QR points here): <a href="${plateUrl}">${plateUrl}</a></p>`
      );
    }
  }

  return NextResponse.json({ received: true });
}
