function formatIdentifier(num: number) {
  return `CSN-${String(num).padStart(6, "0")}`;
}

import crypto from "crypto";
import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildPlateAssets } from "@/lib/buildPlateAssets";
import { buildManufacturingEmailPayload } from "@/lib/buildManufacturingEmailPayload";
import { buildCustomerPlateEmailPayload } from "@/lib/buildCustomerPlateEmailPayload";
import { sendManufacturingEmail } from "@/lib/notifyEmail";
import { sendCustomerPlateEmail } from "@/lib/sendCustomerPlateEmail";
import { ENV } from "@/lib/env";

const LOGO_URL_FALLBACK =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const ASSETS_BUCKET = ENV.PLATE_ASSETS_BUCKET;
const MANUFACTURING_EMAIL_TO = ENV.MANUFACTURING_EMAIL;

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
  console.log("[stripe-webhook] POST received");

  const stripe = stripeClient();
  const sb = supabaseAdmin();

  const sig = req.headers.get("stripe-signature");
  const secret = ENV.STRIPE_WEBHOOK_SECRET;

  console.log("[stripe-webhook] env check", {
    hasStripeSignature: Boolean(sig),
    hasWebhookSecret: Boolean(secret),
    hasAppBaseUrl: Boolean(ENV.APP_BASE_URL),
    hasResendApiKey: Boolean(ENV.RESEND_API_KEY),
    hasFromEmail: Boolean(ENV.FROM_EMAIL),
    manufacturingEmailTo: MANUFACTURING_EMAIL_TO || null,
    assetsBucket: ASSETS_BUCKET,
  });

  if (!sig || !secret) {
    console.error("[stripe-webhook] missing webhook config");
    return NextResponse.json(
      { error: "Missing webhook config" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  console.log("[stripe-webhook] raw body length", rawBody.length);

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);

    console.log("[stripe-webhook] event constructed OK", {
      type: event?.type ?? null,
      id: event?.id ?? null,
      livemode: event?.livemode ?? null,
      created: event?.created ?? null,
    });
  } catch (err: any) {
    console.error("[stripe-webhook] constructEvent failed", {
      message: err?.message ?? "unknown",
      stack: err?.stack ?? null,
      rawBodyLength: rawBody.length,
      hasStripeSignature: Boolean(sig),
      hasWebhookSecret: Boolean(secret),
    });

    return NextResponse.json(
      { error: `Webhook signature failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  console.log("[stripe-webhook] event type", event?.type ?? null);

  if (event.type !== "checkout.session.completed") {
    console.log("[stripe-webhook] ignored event type", event?.type ?? null);
    return NextResponse.json({ received: true });
  }

  try {
    const session = event.data.object as any;
    const sessionId = session.id as string;

    console.log("[stripe-webhook] checkout.session.completed", {
      sessionId,
      paymentStatus: session?.payment_status,
      status: session?.status,
      customerEmail: session?.customer_details?.email ?? null,
      customerName: session?.customer_details?.name ?? null,
      livemode: session?.livemode,
      metadata: session?.metadata ?? null,
    });

    if (!sessionId) {
      throw new Error("Missing Stripe session id");
    }

    const baseUrl = ENV.APP_BASE_URL;
    const logoUrl = ENV.PLATE_LOGO_SVG_URL ?? LOGO_URL_FALLBACK;

    const { data: existingOrder, error: existingOrderErr } = await sb
      .from("orders")
      .select("id, plate_id")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    console.log("[stripe-webhook] existing order check", {
      sessionId,
      hasExistingOrder: Boolean(existingOrder),
      existingOrderId: existingOrder?.id ?? null,
      existingPlateId: existingOrder?.plate_id ?? null,
      existingOrderErr: existingOrderErr?.message ?? null,
    });

    if (existingOrderErr) {
      throw new Error(`Existing order check failed: ${existingOrderErr.message}`);
    }

    if (existingOrder) {
      console.log("[stripe-webhook] duplicate order detected - retrying emails");

      const plateId = existingOrder.plate_id;

      const { data: plate, error: plateLookupErr } = await sb
        .from("plates")
        .select("identifier, slug")
        .eq("id", plateId)
        .single();

      console.log("[stripe-webhook] duplicate plate lookup", {
        plateId,
        plateFound: Boolean(plate),
        plateLookupErr: plateLookupErr?.message ?? null,
      });

      if (plateLookupErr || !plate) {
        throw new Error(
          plateLookupErr?.message ?? "Plate not found for existing order"
        );
      }

      const duplicateCustomerEmail = session.customer_details?.email ?? null;
      const duplicateCustomerName = session.customer_details?.name ?? null;
      const duplicateCustomerPhone = session.customer_details?.phone ?? null;
      const duplicateAddress = session.customer_details?.address ?? null;
      const duplicateLogoUrl = ENV.PLATE_LOGO_SVG_URL ?? LOGO_URL_FALLBACK;
      const duplicateLogoImageHref = await loadLogoSvgDataUrl(duplicateLogoUrl);

      console.log("[stripe-webhook] rebuilding duplicate assets", {
        identifier: plate.identifier,
        slug: plate.slug,
      });

      const duplicateAssets = await buildPlateAssets({
        identifier: plate.identifier,
        slug: plate.slug,
        logoImageHref: duplicateLogoImageHref,
      });

      console.log("[stripe-webhook] duplicate assets built", {
        identifier: duplicateAssets.identifier,
        plateSvgLength: duplicateAssets.plateSvg?.length ?? 0,
        qrPngBufferLength: duplicateAssets.qrPngBuffer?.length ?? 0,
        metadataKeys: duplicateAssets.metadata
          ? Object.keys(duplicateAssets.metadata as Record<string, unknown>)
          : [],
      });

      const duplicateManufacturingPayload = buildManufacturingEmailPayload({
        to: MANUFACTURING_EMAIL_TO,
        identifier: plate.identifier,
        customerName: duplicateCustomerName,
        customerEmail: duplicateCustomerEmail,
        customerPhone: duplicateCustomerPhone,
        shippingName: duplicateCustomerName,
        shippingLine1: duplicateAddress?.line1 ?? null,
        shippingLine2: duplicateAddress?.line2 ?? null,
        shippingCity: duplicateAddress?.city ?? null,
        shippingState: duplicateAddress?.state ?? null,
        shippingPostcode: duplicateAddress?.postal_code ?? null,
        shippingCountry: duplicateAddress?.country ?? null,
        paymentStatus: session.payment_status ?? null,
        amountTotalCents: session.amount_total ?? null,
        currency: session.currency ?? null,
        adminUrl: `${baseUrl}/admin/orders?search=${encodeURIComponent(
          plate.identifier
        )}`,
        svgContent: duplicateAssets.plateSvg,
        qrPngBuffer: duplicateAssets.qrPngBuffer,
        metadata: duplicateAssets.metadata,
      });

      console.log("[stripe-webhook] sending manufacturing email (duplicate path)", {
        to: MANUFACTURING_EMAIL_TO,
        identifier: plate.identifier,
        hasAttachments: duplicateManufacturingPayload.attachments.length > 0,
        attachmentNames: duplicateManufacturingPayload.attachments.map(
          (a) => a.filename
        ),
      });

      const duplicateManufacturingResult = await sendManufacturingEmail(
        duplicateManufacturingPayload
      );

      console.log(
        "[stripe-webhook] manufacturing email result (duplicate path)",
        duplicateManufacturingResult
      );

      let duplicateCustomerEmailResult: unknown = null;

      if (duplicateCustomerEmail) {
        const customerPayload = buildCustomerPlateEmailPayload(duplicateAssets, {
          customerEmail: duplicateCustomerEmail,
          customerName: duplicateCustomerName ?? undefined,
          setupToken: "",
        });

        console.log("[stripe-webhook] sending customer email (duplicate path)", {
          to: customerPayload.to,
          subject: customerPayload.subject,
          identifier: plate.identifier,
        });

        duplicateCustomerEmailResult = await sendCustomerPlateEmail(
          customerPayload
        );

        console.log(
          "[stripe-webhook] customer email result (duplicate path)",
          duplicateCustomerEmailResult
        );
      } else {
        console.warn(
          "[stripe-webhook] duplicate path customer email skipped - no email on session"
        );
      }

      return NextResponse.json({
        received: true,
        duplicate: true,
        emailsRetried: true,
        duplicateManufacturingResult,
        duplicateCustomerEmailResult,
      });
    }

    const email = session.customer_details?.email ?? null;
    const customerName = session.customer_details?.name ?? null;
    const customerPhone = session.customer_details?.phone ?? null;
    const emergencyPlan =
      session?.metadata?.emergency_plan === "10" ? "10" : "3";

    console.log("[stripe-webhook] customer/session values", {
      email,
      customerName,
      customerPhone,
      emergencyPlan,
    });

    const identifier = await generateNextIdentifier(sb);
    const slug = await generateUniqueSlug(sb);
    const setupToken = randToken(48);
    const plateUrl = `${baseUrl}/p/${slug}`;
    const setupUrl = `${baseUrl}/setup/${setupToken}`;
    const logoImageHref = await loadLogoSvgDataUrl(logoUrl);

    console.log("[stripe-webhook] generated values", {
      identifier,
      slug,
      setupTokenPreview: `${setupToken.slice(0, 8)}...`,
      plateUrl,
      setupUrl,
      hasLogoImageHref: Boolean(logoImageHref),
    });

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
        emergency_plan: emergencyPlan,
      })
      .select("id, identifier, slug, emergency_plan")
      .single();

    console.log("[stripe-webhook] plate insert", {
      plateId: plate?.id ?? null,
      identifier: plate?.identifier ?? null,
      slug: plate?.slug ?? null,
      emergencyPlanInserted: plate?.emergency_plan ?? null,
      plateErr: plateErr?.message ?? null,
    });

    if (plateErr || !plate) {
      throw new Error(plateErr?.message ?? "Plate insert failed");
    }

    console.log("[stripe-webhook] building plate assets", {
      identifier,
      slug,
      emergencyPlan,
    });

    const assets = await buildPlateAssets({
      identifier,
      slug,
      logoImageHref,
    });

    console.log("[stripe-webhook] assets built", {
      identifier: assets.identifier,
      plateUrl: assets.plateUrl,
      hasQrPngBuffer: Boolean(assets.qrPngBuffer),
      qrPngBufferLength: assets.qrPngBuffer?.length ?? 0,
      plateSvgLength: assets.plateSvg?.length ?? 0,
      metadataKeys: assets.metadata ? Object.keys(assets.metadata) : [],
    });

    const savedAssets = await uploadPlateAssets(sb, assets);

    console.log("[stripe-webhook] assets uploaded", savedAssets);

    const { error: profileErr } = await sb.from("plate_profiles").insert({
      plate_id: plate.id,
      caravan_name: "",
      bio: null,
      owner_photo_url: null,
    });

    console.log("[stripe-webhook] profile insert", {
      plateId: plate.id,
      profileErr: profileErr?.message ?? null,
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
    });

    console.log("[stripe-webhook] design insert", {
      plateId: plate.id,
      designErr: designErr?.message ?? null,
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

    console.log("[stripe-webhook] order insert", {
      orderId: order?.id ?? null,
      orderErr: orderErr?.message ?? null,
    });

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

    console.log("[stripe-webhook] setup token insert", {
      plateId: plate.id,
      email,
      expiresAt,
      tokenErr: tokenErr?.message ?? null,
    });

    if (tokenErr) {
      throw new Error(`plate_setup_tokens insert failed: ${tokenErr.message}`);
    }

    await updateOrderStatus(sb, order.id, "pack_generated");
    console.log("[stripe-webhook] order status updated", {
      orderId: order.id,
      status: "pack_generated",
    });

    await updatePlateStatus(sb, plate.id, "setup_pending");
    console.log("[stripe-webhook] plate status updated", {
      plateId: plate.id,
      status: "setup_pending",
    });

    const manufacturingPayload = buildManufacturingEmailPayload({
      to: MANUFACTURING_EMAIL_TO,
      identifier: plate.identifier,
      customerName: customerName ?? null,
      customerEmail: email,
      customerPhone: customerPhone,
      shippingName: customerName ?? null,
      shippingLine1: addr?.line1 ?? null,
      shippingLine2: addr?.line2 ?? null,
      shippingCity: addr?.city ?? null,
      shippingState: addr?.state ?? null,
      shippingPostcode: addr?.postal_code ?? null,
      shippingCountry: addr?.country ?? null,
      paymentStatus: session.payment_status ?? null,
      amountTotalCents: session.amount_total ?? null,
      currency: session.currency ?? null,
      adminUrl: `${baseUrl}/admin/orders?search=${encodeURIComponent(
        plate.identifier
      )}`,
      svgContent: assets.plateSvg,
      qrPngBuffer: assets.qrPngBuffer,
      metadata: assets.metadata,
      svgPublicUrl: savedAssets.svgPublicUrl,
      qrPublicUrl: savedAssets.qrPublicUrl,
      metadataPublicUrl: savedAssets.metadataPublicUrl,
    });

    console.log("[stripe-webhook] sending manufacturing email", {
      ...manufacturingPayload,
      attachments: manufacturingPayload.attachments.map((a) => a.filename),
    });

    const manufacturingEmailResult = await sendManufacturingEmail(
      manufacturingPayload
    );

    console.log(
      "[stripe-webhook] manufacturing email result",
      manufacturingEmailResult
    );

    if (manufacturingEmailResult.ok && !manufacturingEmailResult.skipped) {
      await updateOrderStatus(sb, order.id, "sent_to_manufacturing");
      console.log("[stripe-webhook] order status updated", {
        orderId: order.id,
        status: "sent_to_manufacturing",
      });
    }

    let customerEmailResult:
      | {
          ok: boolean;
          skipped?: boolean;
          reason?: string;
          result?: unknown;
          error?: string;
        }
      | null = null;

    if (email) {
      const customerPayload = buildCustomerPlateEmailPayload(assets, {
        customerEmail: email,
        customerName: customerName ?? undefined,
        setupToken,
      });

      console.log("[stripe-webhook] sending customer email", {
        to: customerPayload.to,
        subject: customerPayload.subject,
        identifier: assets.identifier,
      });

      customerEmailResult = await sendCustomerPlateEmail(customerPayload);

      console.log("[stripe-webhook] customer email result", customerEmailResult);
    } else {
      console.warn("[stripe-webhook] customer email skipped - no email on session");
    }

    console.log("[stripe-webhook] success", {
      identifier,
      slug,
      plateUrl,
      setupUrl,
    });

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
    console.error("[stripe-webhook] failed", {
      message: e?.message ?? "Webhook failed",
      stack: e?.stack ?? null,
      error: e,
    });

    return NextResponse.json(
      { error: e?.message ?? "Webhook failed" },
      { status: 500 }
    );
  }
}