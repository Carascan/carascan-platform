// app/api/laser-pack/[plateId]/route.ts

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

if (!plateId) {
return NextResponse.json({ error: "Missing plate id" }, { status: 400 });
}

const { data: plate } = await sb
.from("plates")
.select("id, slug")
.eq("id", plateId)
.maybeSingle();

if (!plate) {
return NextResponse.json({ error: "Plate not found" }, { status: 404 });
}

const { data: design } = await sb
.from("plate_designs")
.select("logo_url")
.eq("plate_id", plateId)
.maybeSingle();

if (!design) {
return NextResponse.json({ error: "Design missing" }, { status: 404 });
}

const baseUrl = process.env.APP_BASE_URL;
if (!baseUrl) {
return NextResponse.json({ error: "APP_BASE_URL missing" }, { status: 500 });
}

const plateUrl = `${baseUrl}/p/${plate.slug}`;

const qrDataUrl = await makeQrPngDataUrl(plateUrl);

const fallbackLogoUrl =
"https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const logoUrl = design.logo_url || fallbackLogoUrl;

let logoSvgText = "";

try {
const res = await fetch(logoUrl, { cache: "no-store" });
if (res.ok) {
logoSvgText = await res.text();
}
} catch {
logoSvgText = "";
}

const slugUpper = String(plate.slug).toUpperCase();
const identifier = slugUpper.startsWith("CSN-")
? slugUpper
: `CSN-${slugUpper}`;

const svg = buildPlateSvg({
slug: plate.slug,
qrDataUrl,

```
plateWidthMm: 90,
plateHeightMm: 90,
cornerRadiusMm: 3,
marginInsetMm: 5,
holeDiameterMm: 4.2,

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
```

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
