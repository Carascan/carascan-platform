import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(
_req: Request,
{ params }: { params: { slug: string } }
) {
const sb = supabaseAdmin();

const { data: plate } = await sb
.from("plates")
.select(
`       id,
      slug,
      contact_enabled,
      emergency_enabled,
      status
      `
)
.eq("slug", params.slug)
.maybeSingle();

if (!plate || plate.status === "disabled") {
return NextResponse.json({ error: "Not found" }, { status: 404 });
}

const { data: profile } = await sb
.from("plate_profiles")
.select(
`       caravan_name,
      bio,
      owner_photo_url
      `
)
.eq("plate_id", plate.id)
.maybeSingle();

return NextResponse.json({
slug: plate.slug,
allowContactOwner: plate.contact_enabled,
allowEmergency: plate.emergency_enabled,
profile: profile ?? null,
});
}
