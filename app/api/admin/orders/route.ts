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

type PlateRow = {
  id: string;
  identifier: string | null;
  slug: string | null;
  status: string | null;
  sku: string | null;
};

type OrderRow = {
  id: string;
  plate_id: string | null;
  status: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_total_cents: number | null;
  currency: string | null;
  shipping_name: string | null;
  shipping_line1: string | null;
  shipping_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postcode: string | null;
  shipping_country: string | null;
  created_at: string | null;
};

type SetupTokenRow = {
  plate_id: string;
  token: string;
  created_at: string | null;
  used_at: string | null;
  revoked_at: string | null;
};

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

    const safePlates: PlateRow[] = plates ?? [];
    const plateIds = safePlates.map((p) => p.id);

    const plateMap = new Map<string, PlateRow>(
      safePlates.map((plate) => [plate.id, plate])
    );

    let orders: OrderRow[] = [];
    let setupTokens: SetupTokenRow[] = [];

    if (plateIds.length > 0) {
      const [{ data: ordersData, error: ordersError }, { data: tokensData, error: tokensError }] =
        await Promise.all([
          sb
            .from("orders")
            .select(
              "id, plate_id, status, stripe_checkout_session_id, stripe_payment_intent_id, amount_total_cents, currency, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postcode, shipping_country, created_at"
            )
            .in("plate_id", plateIds)
            .order("created_at", { ascending: false }),
          sb
            .from("plate_setup_tokens")
            .select("plate_id, token, created_at, used_at, revoked_at")
            .in("plate_id", plateIds)
            .is("revoked_at", null)
            .order("created_at", { ascending: false }),
        ]);

      if (ordersError) {
        return NextResponse.json(
          { error: `Failed to load orders: ${ordersError.message}` },
          { status: 500 }
        );
      }

      if (tokensError) {
        return NextResponse.json(
          { error: `Failed to load setup tokens: ${tokensError.message}` },
          { status: 500 }
        );
      }

      orders = ordersData ?? [];
      setupTokens = tokensData ?? [];
    }

    const latestSetupTokenByPlateId = new Map<string, SetupTokenRow>();

    for (const tokenRow of setupTokens) {
      if (!latestSetupTokenByPlateId.has(tokenRow.plate_id)) {
        latestSetupTokenByPlateId.set(tokenRow.plate_id, tokenRow);
      }
    }

    const itemsFromOrders = orders.map((order) => {
      const plate = order.plate_id ? plateMap.get(order.plate_id) ?? null : null;
      const latestSetupToken =
        order.plate_id ? latestSetupTokenByPlateId.get(order.plate_id) ?? null : null;

      return {
        ...order,
        setup_token: latestSetupToken?.token ?? null,
        setup_token_created_at: latestSetupToken?.created_at ?? null,
        plate,
      };
    });

    const orderedPlateIds = new Set(
      orders
        .map((order) => String(order.plate_id ?? "").trim())
        .filter(Boolean)
    );

    const plateOnlyItems = safePlates
      .filter((plate) => !orderedPlateIds.has(String(plate.id)))
      .map((plate) => {
        const latestSetupToken = latestSetupTokenByPlateId.get(plate.id) ?? null;

        return {
          id: `plate-${plate.id}`,
          plate_id: plate.id,
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
          setup_token: latestSetupToken?.token ?? null,
          setup_token_created_at: latestSetupToken?.created_at ?? null,
          plate,
        };
      });

    const items = [...itemsFromOrders, ...plateOnlyItems];

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