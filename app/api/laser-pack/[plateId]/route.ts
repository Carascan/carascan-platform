import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { makeQrPngDataUrl } from "@/lib/qr";
import { buildPlateSvg } from "@/lib/laserSvg";

export async function GET(_req: Request, { params }: { params: { plateId: string } }) {
  const sb = supabaseAdmin();
  const plateId = params.plateId;

  const { data: plate } = await sb.from("plates").select("*").eq("id", plateId).maybeSingle();
  if (!plate) return NextResponse.json({ error: "Plate not found" }, { status: 404 });

  const { data: profile } = await sb.from("plate_profiles").select("*").eq("plate_id", plateId).maybeSingle();
  const { data: design } = await sb.from("plate_designs").select("*").eq("plate_id", plateId).maybeSingle();
  if (!profile || !design) return NextResponse.json({ error: "Profile/design missing" }, { status: 404 });
  const { data: profile } = await sb.from("plate_profiles").select("*").eq("plate_id", plateId).maybeSingle();
const { data: design } = await sb.from("plate_designs").select("*").eq("plate_id", plateId).maybeSingle();
if (!profile || !design) return NextResponse.json({ error: "Profile/design missing" }, { status: 404 });

let logoSvgText = "";

if (design.logo_url) {
  const res = await fetch(design.logo_url);
  if (res.ok) {
    logoSvgText = await res.text();
  }
}

  const baseUrl = process.env.APP_BASE_URL!;
  const plateUrl = `${baseUrl}/p/${plate.slug}`;
  const qrDataUrl = await makeQrPngDataUrl(plateUrl);

const svg = buildPlateSvg({
  slug: plate.slug,
  qrDataUrl,

  plateWidthMm: design.plate_width_mm ?? 90,
  plateHeightMm: design.plate_height_mm ?? 90,

  cornerRadiusMm: 3,
  marginInsetMm: 5,

  holeDiameterMm: design.hole_diameter_mm ?? 4.2,
  qrSizeMm: design.qr_size_mm ?? 55,

  identifier: plate.slug,
  logoSvgText
});

  // Identifier: for now use slug (works immediately).
  // Later we can switch this to a stored CSN-xxxxxxx field.
  identifier: `CSN-${String(plate.id).slice(-7).replace(/\D/g, "0")}`,

  // If you do NOT want any logo text in the generated SVG (because you place it in LightBurn),
  // set this to "".
  logoText: "CARASCAN",
});

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="CARASCAN_${plate.slug}_60x90.svg"`
    }
  });
}
