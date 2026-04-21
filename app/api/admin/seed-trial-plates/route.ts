import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ENV } from "@/lib/env";

const START_NUMBER = 180;
const COUNT = 20;

const LOGO_URL_FALLBACK =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

function formatIdentifier(num: number) {
  return `CSN-${String(num).padStart(6, "0")}`;
}

function randSlug(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function randRef(len = 12) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

async function generateUniqueSlug(sb: ReturnType<typeof supabaseAdmin>) {
  for (let i = 0; i < 20; i++) {
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

function isAuthorised(req: Request) {
  const secret = ENV.ADMIN_ACTION_SECRET;
  const headerSecret = req.headers.get("x-admin-secret");
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");

  return Boolean(
    secret &&
      (headerSecret === secret || querySecret === secret)
  );
}

export async function POST(req: Request) {
  try {
    if (!isAuthorised(req)) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const logoUrl = ENV.PLATE_LOGO_SVG_URL ?? LOGO_URL_FALLBACK;

    const created: Array<{
      identifier: string;
      plateId: string;
      slug: string;
    }> = [];

    const skipped: Array<{
      identifier: string;
      plateId: string;
      slug: string | null;
      reason: string;
    }> = [];

    for (let offset = 0; offset < COUNT; offset++) {
      const sequence = START_NUMBER + offset;
      const identifier = formatIdentifier(sequence);

      const { data: existingPlate, error: existingPlateError } = await sb
        .from("plates")
        .select("id, identifier, slug")
        .eq("identifier", identifier)
        .maybeSingle();

      if (existingPlateError) {
        throw new Error(
          `Existing plate lookup failed for ${identifier}: ${existingPlateError.message}`
        );
      }

      if (existingPlate) {
        skipped.push({
          identifier,
          plateId: existingPlate.id,
          slug: existingPlate.slug ?? null,
          reason: "identifier already exists",
        });
        continue;
      }

      const slug = await generateUniqueSlug(sb);

      const { data: plate, error: plateError } = await sb
        .from("plates")
        .insert({
          identifier,
          slug,
          status: "setup_pending",
          contact_enabled: true,
          emergency_enabled: true,
          preferred_contact_channel: "email",
          sku: "CARASCAN_90x90",
          emergency_plan: "10",
        })
        .select("id, identifier, slug")
        .single();

      if (plateError || !plate) {
        throw new Error(
          `Plate insert failed for ${identifier}: ${plateError?.message ?? "unknown error"}`
        );
      }

      const { error: profileError } = await sb.from("plate_profiles").insert({
        plate_id: plate.id,
        caravan_name: "",
        bio: null,
        owner_photo_url: null,
      });

      if (profileError) {
        throw new Error(
          `Profile insert failed for ${identifier}: ${profileError.message}`
        );
      }

      const qrUrl = `${ENV.APP_BASE_URL}/api/qr/${randRef(12)}`;

      const { error: designError } = await sb.from("plate_designs").insert({
        plate_id: plate.id,
        text_line_1: "",
        text_line_2: "",
        logo_url: logoUrl,
        qr_url: qrUrl,
        proof_approved: false,
        plate_width_mm: 90,
        plate_height_mm: 90,
        qr_size_mm: 50,
        hole_diameter_mm: 5.2,
      });

      if (designError) {
        throw new Error(
          `Design insert failed for ${identifier}: ${designError.message}`
        );
      }

      created.push({
        identifier: plate.identifier,
        plateId: plate.id,
        slug: plate.slug,
      });
    }

    return NextResponse.json({
      ok: true,
      batch: {
        start: formatIdentifier(START_NUMBER),
        end: formatIdentifier(START_NUMBER + COUNT - 1),
        count: COUNT,
      },
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped,
    });
  } catch (error: any) {
    console.error("Seed trial plates failed:", error);

    return NextResponse.json(
      { error: error?.message ?? "Failed to seed trial plates" },
      { status: 500 }
    );
  }
}