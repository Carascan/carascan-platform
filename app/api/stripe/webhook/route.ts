import crypto from "crypto";
import { NextResponse } from "next/server";
import { stripeClient, formatIdentifier } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildPlateAssets } from "@/lib/buildPlateAssets";
import { buildManufacturingEmailPayload } from "@/lib/buildManufacturingEmailPayload";
import { buildCustomerPlateEmailPayload } from "@/lib/buildCustomerPlateEmailPayload";
import { sendManufacturingEmail, sendEmail } from "@/lib/notifyEmail";
import { sendCustomerPlateEmail } from "@/lib/sendCustomerPlateEmail";

const LOGO_URL_FALLBACK =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const ASSETS_BUCKET = process.env.PLATE_ASSETS_BUCKET ?? "assets";
const MANUFACTURING_EMAIL_TO =
  process.env.MANUFACTURING_EMAIL_TO ?? process.env.FROM_EMAIL ?? "";

function randSlug(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function randToken(len = 48) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
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

async function generateNextIdentifier(sb: ReturnType<typeof supabaseAdmin>) {
  const { data, error } = await sb
    .from("plates")
    .select("identifier")
    .like("identifier", "CSN-%")
    .order("identifier", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Identifier lookup failed: ${error.message}`);
  }

  const current = data?.identifier ?? null;
  const currentNumber =
    current && /^CSN-(\d{6})$/.test(current) ? Number(current.slice(4)) : 0;

  return formatIdentifier(currentNumber + 1);
}

function readMountingHoles(session: any): boolean {
  const raw = session?.metadata?.mounting_holes;
  if (raw == null) return true;
  return String(raw).toLowerCase() === "true";
}

async function loadLogoSvgDataUrl(logoUrl: string): Promise<string> {
  try {
    const response = await fetch(logoUrl, { cache: "no-store" });

    if (!response.ok) {
      console.warn(`Logo fetch failed: ${response.status} ${response.statusText}`);
      return "";
    }

    const svgText = await response.text();
    const base64 = Buffer.from(svgText, "utf8").toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.warn("Logo fetch failed:", error);
    return "";
  }
}

async function uploadPlateAssets(
  sb: ReturnType<typeof supabaseAdmin>,
  assets: Awaited<ReturnType<typeof buildPlateAssets>>
) {
  const prefix = `plates/${assets.identifier}`;

  const qrPath = `${prefix}/qr.png`;
  const svgPath = `${prefix}/plate.svg`;
  const metadataPath = `${prefix}/metadata.json`;

  const qrUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(qrPath, assets.qrPngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (qrUpload.error) {
    throw new Error(`QR upload failed: ${qrUpload.error.message}`);
  }

  const svgUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(svgPath, assets.plateSvg, {
      contentType: "image/svg+xml",
      upsert: true,
    });

  if (svgUpload.error) {
    throw new Error(`SVG upload failed: ${svgUpload.error.message}`);
  }

  const metadataUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(metadataPath, JSON.stringify(assets.metadata, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (metadataUpload.error) {
    throw new Error(`Metadata upload failed: ${metadataUpload.error.message}`);
  }

  const { data: qrPublic } = sb.storage.from(ASSETS_BUCKET).getPublicUrl(qrPath);
  const { data: svgPublic } = sb.storage.from(ASSETS_BUCKET).getPublicUrl(svgPath);
  const { data: metadataPublic } = sb.storage
    .from(ASSETS_BUCKET)
    .getPublicUrl(metadataPath);

  return {
    qrPath,
    svgPath,
    metadataPath,
    qrPublicUrl: qrPublic?.publicUrl ?? null,
    svgPublicUrl: svgPublic?.publicUrl ?? null,
    metadataPublicUrl: metadataPublic?.publicUrl ?? null,
  };
}

async function updateOrderStatus(
  sb: ReturnType<typeof supabaseAdmin>,
  orderId: string,
  status: "paid" | "pack_generated" | "sent_to_manufacturing" | "cancelled"
) {
  const { error } = await sb.from("orders").update({ status }).eq("id", orderId);

  if (error) {
    throw new Error(`Order status update failed: ${error.message}`);
  }
}

async function updatePlateStatus(
  sb: ReturnType<typeof supabaseAdmin>,
  plateId: string,
  status: "draft" | "setup_pending" | "active" | "disabled"
) {
  const { error } = await sb.from("plates").update({ status }).eq("id", plateId);

  if (error) {
    throw new Error(`Plate status update failed: ${error.message}`);
  }
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const sb = supabaseAdmin();

  const sig = req.headers.get("stripe-signature");
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

    const logoUrl = process.env.PLATE_LOGO_SVG_URL ?? LOGO_URL_FALLBACK;

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
    const customerName = session.customer_details?.name ?? null;
    const customerPhone = session.customer_details?.phone ?? null;
    const mountingHoles = readMountingHoles(session);

    const identifier = await generateNextIdentifier(sb);
    const slug = await generateUniqueSlug(sb);
    const setupToken = randToken(48);
    const plateUrl = `${baseUrl}/p/${slug}`;
    const setupUrl = `${baseUrl}/setup/${setupToken}`;
    const logoImageHref = await loadLogoSvgDataUrl(logoUrl);

    const { data: plate, error: plateErr } = await sb
      .from("plates")
      .insert({
        identifier,
        slug,
        status: "draft",
        contact_enabled: true,
        emergency_enabled: true,
        preferred_contact_channel: "email",
        sku: "CARASCAN_90x90",
      })
      .select("id, identifier, slug")
      .single();

    if (plateErr || !plate) {
      throw new Error(plateErr?.message ?? "Plate insert failed");
    }

    const assets = await buildPlateAssets({
      identifier,
      slug,
      mountingHoles,
      logoImageHref,
    });

    const savedAssets = await uploadPlateAssets(sb, assets);

    const { error: profileErr } = await sb.from("plate_profiles").insert({
      plate_id: plate.id,
      caravan_name: "",
      bio: null,
      owner_photo_url: null,
    });

    if (profileErr) {
      throw new Error(`plate_profiles insert failed: ${profileErr.message}`);
    }

    const { error: designErr } = await sb.from("plate_designs").insert({
      plate_id: plate.id,
      text_line_1: "",
      text_line_2: "",
      logo_url: logoUrl,
      qr_url: savedAssets.qrPublicUrl,
      proof_approved: false,
      plate_width_mm: 90,
      plate_height_mm: 90,
      qr_size_mm: 50,
      hole_diameter_mm: 5.2,
      mounting_holes: mountingHoles,
    });

    if (designErr) {
      throw new Error(`plate_designs insert failed: ${designErr.message}`);
    }

    const addr = session.customer_details?.address ?? null;

    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        plate_id: plate.id,
        status: "paid",
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id: session.payment_intent ?? null,
        amount_total_cents: session.amount_total ?? null,
        currency: session.currency ?? null,
        shipping_name: customerName,
        shipping_line1: addr?.line1 ?? null,
        shipping_line2: addr?.line2 ?? null,
        shipping_city: addr?.city ?? null,
        shipping_state: addr?.state ?? null,
        shipping_postcode: addr?.postal_code ?? null,
        shipping_country: addr?.country ?? null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      throw new Error(orderErr?.message ?? "orders insert failed");
    }

    const expiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 14
    ).toISOString();

    const { error: tokenErr } = await sb.from("plate_setup_tokens").insert({
      token: setupToken,
      plate_id: plate.id,
      email,
      expires_at: expiresAt,
    });

    if (tokenErr) {
      throw new Error(`plate_setup_tokens insert failed: ${tokenErr.message}`);
    }

    await updateOrderStatus(sb, order.id, "pack_generated");
    await updatePlateStatus(sb, plate.id, "setup_pending");

    const manufacturingPayload = buildManufacturingEmailPayload({
      to: MANUFACTURING_EMAIL_TO,
      identifier: plate.identifier,
    });

    const manufacturingEmailResult = await sendManufacturingEmail(
      manufacturingPayload
    );

    if (manufacturingEmailResult.ok && !manufacturingEmailResult.skipped) {
      await updateOrderStatus(sb, order.id, "sent_to_manufacturing");
    }

    let customerEmailResult:
      | { ok: boolean; skipped?: boolean; reason?: string; result?: unknown; error?: string }
      | null = null;

    if (email) {
      const customerPayload = buildCustomerPlateEmailPayload(assets, {
        customerEmail: email,
        customerName: customerName ?? undefined,
        setupToken,
      });

      customerEmailResult = await sendCustomerPlateEmail(customerPayload);
    }

    return NextResponse.json({
      received: true,
      identifier,
      slug,
      plateUrl,
      setupUrl,
      assets: savedAssets,
      manufacturingEmail: manufacturingEmailResult,
      customerEmail: customerEmailResult,
    });
  } catch (e: any) {
    console.error("Webhook failed:", e);
    return NextResponse.json(
      { error: e?.message ?? "Webhook failed" },
      { status: 500 }
    );
  }
}