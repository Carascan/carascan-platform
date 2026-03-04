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

  // Load plate
  const { data: plate, error: plateErr } = await sb
    .from("plates")
    .select("*")
    .eq("id", plateId)
    .maybeSingle();

  if (plateErr) {
    return NextResponse.json({ error: plateErr.message }, { status: 500 });
  }
  if (!plate) {
    return NextResponse.json({ error: "Plate not found" }, { status: 404 });
  }

  // Load profile + design
  const { data: profile, error: profileErr } = await sb
    .from("plate_profiles")
    .select("*")
    .eq("plate_id", plateId)
    .maybeSingle();

  const { data: design, error: designErr } = await sb
    .from("plate_designs")
    .select("*")
    .eq("plate_id", plateId)
    .maybeSingle();

  if (profileErr || designErr) {
    return NextResponse.json(
      { error: profileErr?.message ?? designErr?.message ?? "DB error" },
      { status: 500 }
    );
  }
  if (!profile || !design) {
    return NextResponse.json(
      { error: "Profile/design missing" },
      { status: 404 }
    );
  }

  // Build QR target URL
  const baseUrl = process.env.APP_BASE_URL!;
  const plateUrl = `${baseUrl}/p/${plate.slug}`;
  const qrDataUrl = await makeQrPngDataUrl(plateUrl);

  // Use CSN if present, otherwise fallback to slug
  const identifier =
    (design as any).identifier_text || plate.slug; // identifier_text column you added

  // IMPORTANT:
  // If you're engraving the real SVG logo separately in LightBurn,
  // set logoText to "" so it doesn't put placeholder text on the SVG.
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
    logoText: "",              // <-- keep empty if LightBurn handles the logo SVG
    includeCrosshair: true,    // jig alignment helper
  });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // update filename to 90x90
      "content-disposition": `attachment; filename="CARASCAN_${plate.slug}_90x90.svg"`,
    },
  });
}