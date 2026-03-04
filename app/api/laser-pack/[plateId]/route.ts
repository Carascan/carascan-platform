import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngDataUrl } from "@/lib/qr";
import { buildPlateSvg } from "@/lib/laserSvg";

export async function GET(
  _req: Request,
  { params }: { params: { plateId: string } }
) {
  const sb = supabaseAdmin();
  const plateId = params.plateId;

  const { data: plate, error: plateErr } = await sb
    .from("plates")
    .select("*")
    .eq("id", plateId)
    .maybeSingle();

  if (plateErr) return NextResponse.json({ error: plateErr.message }, { status: 500 });
  if (!plate) return NextResponse.json({ error: "Plate not found" }, { status: 404 });

  const { data: design, error: designErr } = await sb
    .from("plate_designs")
    .select("*")
    .eq("plate_id", plateId)
    .maybeSingle();

  if (designErr) return NextResponse.json({ error: designErr.message }, { status: 500 });
  if (!design) return NextResponse.json({ error: "Design missing" }, { status: 404 });

  // Build URL that QR points at
  const baseUrl = process.env.APP_BASE_URL!;
  const plateUrl = `${baseUrl}/p/${plate.slug}`;
  const qrDataUrl = await makeQrPngDataUrl(plateUrl);

  // Fetch logo SVG (vector) if present
  let logoSvgRaw: string | null = null;
  if (design.logo_url) {
    try {
      const res = await fetch(design.logo_url);
      if (res.ok) logoSvgRaw = await res.text();
    } catch {
      // ignore; we can still generate QR+ID
      logoSvgRaw = null;
    }
  }

  // Identifier text (prefer design.identifier_text if you added it)
  const identifier =
    (design as any).identifier_text || `CSN-${String(plate.id).replace(/\D/g, "").slice(-7).padStart(7, "0")}`;

  const svg = buildPlateSvg({
    slug: plate.slug,
    qrDataUrl,

    plateWidthMm: design.plate_width_mm ?? 90,
    plateHeightMm: design.plate_height_mm ?? 90,
    cornerRadiusMm: 3,
    marginInsetMm: 5,

    holeDiameterMm: design.hole_diameter_mm ?? 4.2,
    qrSizeMm: design.qr_size_mm ?? 55,

    identifier,
    logoSvgRaw,

    includeCrosshair: true,
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="CARASCAN_${plate.slug}_90x90.svg"`,
    },
  });
}