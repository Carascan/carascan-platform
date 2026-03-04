import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngBuffer } from "@/lib/qr";
import { sendEmail } from "@/lib/notifyEmail";

function randSlug(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function randToken(len = 48) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  console.log("CARASCAN_WEBHOOK_DEPLOY", new Date().toISOString());

  const stripe = stripeClient();
  const sb = supabaseAdmin();

  const sig = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing webhook config" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as any;
      console.log("checkout.session.completed", { sessionId: session.id });

      const email = session.customer_details?.email ?? null;

      // Generate unique slug
      let slug = randSlug(10);
      for (let i = 0; i < 5; i++) {
        const { data, error } = await sb.from("plates").select("id").eq("slug", slug).maybeSingle();
        if (error) throw new Error(`slug check failed: ${error.message}`);
        if (!data) break;
        slug = randSlug(10);
      }

      // Insert plate
      const { data: plate, error: plateErr } = await sb
        .from("plates")
        .insert({
          slug,
          status: "draft",
          contact_enabled: true,
          emergency_enabled: true,
          preferred_contact_channel: "email",
          sku: "CARASCAN_90x90",
        })
        .select("*")
        .single();

      if (plateErr || !plate) throw new Error(plateErr?.message ?? "Plate insert failed");

      const baseUrl = process.env.APP_BASE_URL!;
      const plateUrl = `${baseUrl}/p/${slug}`;

      // Generate QR and upload to storage
      const png = await makeQrPngBuffer(plateUrl);
      const filePath = `${slug}.png`;

      const upload = await sb.storage.from("qr").upload(filePath, png, {
        contentType: "image/png",
        upsert: true,
      });
      if (upload.error) throw new Error(`qr upload failed: ${upload.error.message}`);

      const { data: publicData } = sb.storage.from("qr").getPublicUrl(filePath);
      const qrUrl = publicData?.publicUrl;
      if (!qrUrl) throw new Error("qr public url missing");

      // Insert profile
      const r1 = await sb.from("plate_profiles").insert({
        plate_id: plate.id,
        caravan_name: "Caravan",
        bio: null,
        owner_photo_url: null,
      });
      if (r1.error) throw new Error(`plate_profiles insert failed: ${r1.error.message}`);

      // Insert design (NO caravan text lines anymore)
const r2 = await sb.from("plate_designs").insert({
  plate_id: plate.id,

const r2 = await sb.from("plate_designs").insert({
  plate_id: plate.id,

  // no text lines
  text_line_1: null,
  text_line_2: null,

  // store logo url (we fetch+embed it later for the laser SVG)
  logo_url: "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg",

  qr_url: qrUrl,
  proof_approved: false,

  // physical plate dims
  plate_width_mm: 90,
  plate_height_mm: 90,
  qr_size_mm: 50,
  hole_diameter_mm: 4.2,
});

if (r2.error) throw new Error(`plate_designs insert failed: ${r2.error.message}`);
  // must be an actual SVG URL (not .afdesign)
  logo_url: process.env.PLATE_LOGO_SVG_URL ?? null,

  qr_url: qrUrl,
  proof_approved: false,

  // correct physical plate dimensions
  plate_width_mm: 90,
  plate_height_mm: 90,

  // your QR is 50x50
  qr_size_mm: 50,

  hole_diameter_mm: 4.2,
});
if (r2.error) throw new Error(`plate_designs insert failed: ${r2.error.message}`);

  // no text lines anymore
  text_line_1: null,
  text_line_2: null,

  logo_url: process.env.PLATE_LOGO_SVG_URL ?? null,
  qr_url: qrUrl,
  proof_approved: false,

  // correct physical plate dimensions
  plate_width_mm: 90,
  plate_height_mm: 90,
  qr_size_mm: 50,

  hole_diameter_mm: 4.2
});
      if (r2.error) throw new Error(`plate_designs insert failed: ${r2.error.message}`);

      // Insert order
      const addr = session.customer_details?.address ?? null;
      const r3 = await sb.from("orders").insert({
        plate_id: plate.id,
        status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_total_cents: session.amount_total,
        currency: session.currency,
        shipping_name: session.customer_details?.name ?? null,
        shipping_line1: addr?.line1 ?? null,
        shipping_line2: addr?.line2 ?? null,
        shipping_city: addr?.city ?? null,
        shipping_state: addr?.state ?? null,
        shipping_postcode: addr?.postal_code ?? null,
        shipping_country: addr?.country ?? null,
      });
      if (r3.error) throw new Error(`orders insert failed: ${r3.error.message}`);

      // Setup token
      const token = randToken(48);
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
      const r4 = await sb.from("plate_setup_tokens").insert({
        token,
        plate_id: plate.id,
        email,
        expires_at: expires,
      });
      if (r4.error) throw new Error(`plate_setup_tokens insert failed: ${r4.error.message}`);

      // Send email
      if (email) {
        const setupUrl = `${baseUrl}/setup/${token}`;
        await sendEmail(
          email,
          "Carascan: set up your plate",
          `<p>Thanks for your Carascan purchase.</p>
           <p>Set up your plate here:</p>
           <p><a href="${setupUrl}">${setupUrl}</a></p>
           <p>Your public plate link:</p>
           <p><a href="${plateUrl}">${plateUrl}</a></p>`
        );
      }
    } catch (e: any) {
      console.error("Webhook failed:", e);
      return NextResponse.json({ error: e.message ?? "Webhook failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}