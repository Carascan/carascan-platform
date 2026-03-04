// app/api/laser-pack/[plateId]/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngDataUrl } from "@/lib/qr";
import { buildPlateSvg } from "@/lib/laserSvg";

export async function GET(_req: Request, { params }: { params: { plateId: string } }) {
  const sb = supabaseAdmin();
  const plateId = params.plateId;

  const { data: plate } = await sb.from("plates").select("*").eq("id", plateId).maybeSingle();
  if (!plate) return NextResponse.json({ error: "Plate not found" }, { status: 404 });

  const { data: design } = await sb.from("plate_designs").select("*").eq("plate_id", plateId).maybeSingle();
  if (!design) return NextResponse.json({ error: "Design missing" }, { status: 404 });

  const baseUrl = process.env.APP_BASE_URL!;
  const plateUrl = `${baseUrl}/p/${plate.slug}`;

  // QR embedded as PNG data URL inside output SVG
  const qrDataUrl = await makeQrPngDataUrl(plateUrl);

  // Fetch logo SVG so the final plate SVG is fully self-contained
  const fallbackLogoUrl =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";
  const logoUrl = (design.logo_url as string | null) || fallbackLogoUrl;

  let logoSvgText = "";
  try {
    const res = await fetch(logoUrl, { cache: "no-store" });
    if (res.ok) logoSvgText = await res.text();
  } catch {
    logoSvgText = "";
  }

  // Identifier: use slug, forced to CSN- format (change later if you add a dedicated csn field)
  const slugUpper = String(plate.slug).toUpperCase();
  const identifier = slugUpper.startsWith("CSN-") ? slugUpper : `CSN-${slugUpper}`;

  const svg = buildPlateSvg({
    slug: plate.slug,
    qrDataUrl,

    // Physical plate
    plateWidthMm: 90,
    plateHeightMm: 90,
    cornerRadiusMm: 3,
    marginInsetMm: 5,
    holeDiameterMm: 4.2,

    // Option B (your confirmed centres + sizes)
    logoCenterX: 45,
    logoCenterY: 16,
    logoWidthMm: 84,
    logoHeightMm: 9.2,
    logoSvgText,

    qrCenterX: 45,
    qrCenterY: 51,
    qrSizeMm: 50,

    idCenterX: 45,
    idCenterY: 82,
    idFontSizeMm: 4.2,
    identifier,

    includeCrosshair: true,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="CARASCAN_${plate.slug}_90x90.svg"`,
      "cache-control": "no-store",
    },
  });
}