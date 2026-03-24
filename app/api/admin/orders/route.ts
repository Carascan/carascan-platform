import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requireAdminActionSecret } from "@/lib/env";

function unauthorised() {
  return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
}

function normaliseIdentifierSearch(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;
  return `CSN-${digits.padStart(6, "0")}`;
}

export async function GET(req: Request) {
  try {
    const provided = req.headers.get("x-admin-secret")?.trim() ?? "";
    const expected = requireAdminActionSecret();

    if (!provided || provided !== expected) {
      return unauthorised();
    }

    const url = new URL(req.url);
    const q = normaliseIdentifierSearch(url.searchParams.get("q") ?? "");

    const sb = supabaseAdmin();

    let platesQuery = sb
      .from("plates")
      .select("id, identifier, slug, status, sku")
      .order("identifier", { ascending: false });

    if (q) {
      platesQuery = platesQuery.ilike("identifier", `%${q}%`);
    }

    const { data: plates, error: platesError } = await platesQuery;

    if (platesError) {
      return NextResponse.json(
        { error: `Failed to load plates: ${platesError.message}` },
        { status: 500 }
      );
    }

    const plateIds = (plates ?? []).map((p) => p.id);

    let orders: any[] = [];

    if (plateIds.length > 0) {
      const { data: ordersData, error: ordersError } = await sb
        .from("orders")
        .select(
          "id, plate_id, status, stripe_checkout_session_id, stripe_payment_intent_id, amount_total_cents, currency, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postcode, shipping_country, created_at"
        )
        .in("plate_id", plateIds)
        .order("created_at", { ascending: false });

      if (ordersError) {
        return NextResponse.json(
          { error: `Failed to load orders: ${ordersError.message}` },
          { status: 500 }
        );
      }

      orders = ordersData ?? [];
    }

    const plateMap = new Map((plates ?? []).map((plate) => [plate.id, plate]));

    const items = orders.map((order) => ({
      ...order,
      plate: plateMap.get(order.plate_id) ?? null,
    }));

    if (!q && items.length === 0 && (plates?.length ?? 0) > 0) {
      const plateOnlyItems = (plates ?? []).map((plate) => ({
        id: `plate-${plate.id}`,
        status: null,
        stripe_checkout_session_id: null,
        stripe_payment_intent_id: null,
        amount_total_cents: null,
        currency: null,
        shipping_name: null,
        shipping_line1: null,
        shipping_line2: null,
        shipping_city: null,
        shipping_state: null,
        shipping_postcode: null,
        shipping_country: null,
        created_at: null,
        plate,
      }));

      return NextResponse.json({ items: plateOnlyItems });
    }

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load admin orders.",
      },
      { status: 500 }
    );
  }
}