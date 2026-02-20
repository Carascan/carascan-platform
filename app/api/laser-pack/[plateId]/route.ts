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

  const baseUrl = process.env.APP_BASE_URL!;
  const plateUrl = `${baseUrl}/p/${plate.slug}`;
  const qrDataUrl = await makeQrPngDataUrl(plateUrl);

  const svg = buildPlateSvg({
  slug: plate.slug,
  qrDataUrl
});

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "content-disposition": `attachment; filename="CARASCAN_${plate.slug}_60x90.svg"`
    }
  });
}
