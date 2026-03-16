import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

function isAuthorised(req: Request) {
  const envSecret = process.env.ADMIN_ACTION_SECRET;
  if (!envSecret) return false;

  const headerSecret = req.headers.get("x-admin-secret");
  return headerSecret === envSecret;
}

export async function GET(req: Request) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  const sb = supabaseAdmin();

  let query = sb
    .from("orders")
    .select(
      `
      id,
      status,
      stripe_checkout_session_id,
      stripe_payment_intent_id,
      amount_total_cents,
      currency,
      shipping_name,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_state,
      shipping_postcode,
      shipping_country,
      created_at,
      plate:plate_id (
        id,
        identifier,
        slug,
        status,
        sku
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: `Orders fetch failed: ${error.message}` },
      { status: 500 },
    );
  }

  const rows = (data ?? []).filter((row: any) => {
    if (!q) return true;

    const haystack = [
      row.id,
      row.status,
      row.stripe_checkout_session_id,
      row.stripe_payment_intent_id,
      row.shipping_name,
      row.shipping_line1,
      row.shipping_city,
      row.shipping_state,
      row.shipping_postcode,
      row.shipping_country,
      row.plate?.id,
      row.plate?.identifier,
      row.plate?.slug,
      row.plate?.status,
      row.plate?.sku,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q.toLowerCase());
  });

  return NextResponse.json({
    ok: true,
    items: rows,
  });
}