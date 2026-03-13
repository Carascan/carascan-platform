// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngBuffer } from "@/lib/qr";
import { sendEmail } from "@/lib/notifyEmail";

function randSlug(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function randToken(len = 48) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function generateUniqueSlug(sb: ReturnType<typeof supabaseAdmin>) {
  for (let i = 0; i < 10; i++) {
    const slug = randSlug(10);

    const { data, error } = await sb
      .from("plates")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(`Slug check failed: ${error.message}`);
    }

    if (!data) {
      return slug;
    }
  }

  throw new Error("Failed to generate unique slug");
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const sb = supabaseAdmin();

  const sig = headers().get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Missing webhook config" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const session = event.data.object as any;
    const sessionId = session.id as string;

    if (!sessionId) {
      throw new Error("Missing Stripe session id");
    }

    const baseUrl = process.env.APP_BASE_URL;
    if (!baseUrl) {
      throw new Error("Missing APP_BASE_URL");
    }

    // Prevent duplicate processing if Stripe retries webhook
    const { data: existingOrder, error: existingOrderErr } = await sb
      .from("orders")
      .select("id, plate_id")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (existingOrderErr) {
      throw new Error(`Existing order check failed: ${existingOrderErr.message}`);
    }

    if (existingOrder) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const email = session.customer_details?.email ?? null;
    const slug = await generateUniqueSlug(sb);
    const plateUrl = `${baseUrl}/p/${slug}`;

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
      .select("id, slug")
      .single();

    if (plateErr || !plate) {
      throw new Error(plateErr?.message ?? "Plate insert failed");
    }

    // Generate and upload QR
    const png = await makeQrPngBuffer(plateUrl);
    const filePath = `${slug}.png`;

    const upload = await sb.storage.from("qr").upload(filePath, png, {
      contentType: "image/png",
      upsert: true,
    });

    if (upload.error) {
      throw new Error(`QR upload failed: ${upload.error.message}`);
    }

    const { data: publicData } = sb.storage.from("qr").getPublicUrl(filePath);
    const qrUrl = publicData?.publicUrl;

    if (!qrUrl) {
      throw new Error("QR public URL missing");
    }

    // Insert profile
    const { error: profileErr } = await sb.from("plate_profiles").insert({
      plate_id: plate.id,
      caravan_name: "",
      bio: null,
      owner_photo_url: null,
    });

    if (profileErr) {
      throw new Error(`plate_profiles insert failed: ${profileErr.message}`);
    }

    // Insert design
    const logoUrl =
      process.env.PLATE_LOGO_SVG_URL ??
      "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

    const { error: designErr } = await sb.from("plate_designs").insert({
      plate_id: plate.id,
      text_line_1: "",
      text_line_2: "",
      logo_url: logoUrl,
      qr_url: qrUrl,
      proof_approved: false,
      plate_width_mm: 90,
      plate_height_mm: 90,
      qr_size_mm: 50,
      hole_diameter_mm: 4.2,
    });

    if (designErr) {
      throw new Error(`plate_designs insert failed: ${designErr.message}`);
    }

    // Insert order
    const addr = session.customer_details?.address ?? null;

    const { error: orderErr } = await sb.from("orders").insert({
      plate_id: plate.id,
      status: "paid",
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent ?? null,
      amount_total_cents: session.amount_total ?? null,
      currency: session.currency ?? null,
      shipping_name: session.customer_details?.name ?? null,
      shipping_line1: addr?.line1 ?? null,
      shipping_line2: addr?.line2 ?? null,
      shipping_city: addr?.city ?? null,
      shipping_state: addr?.state ?? null,
      shipping_postcode: addr?.postal_code ?? null,
      shipping_country: addr?.country ?? null,
    });

    if (orderErr) {
      throw new Error(`orders insert failed: ${orderErr.message}`);
    }

    // Insert setup token
    const token = randToken(48);
    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 14
    ).toISOString();

    const { error: tokenErr } = await sb.from("plate_setup_tokens").insert({
      token,
      plate_id: plate.id,
      email,
      expires_at: expiresAt,
    });

    if (tokenErr) {
      throw new Error(`plate_setup_tokens insert failed: ${tokenErr.message}`);
    }

    // Email buyer
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

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error("Webhook failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Webhook failed" },
      { status: 500 }
    );
  }
}