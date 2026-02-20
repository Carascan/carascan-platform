import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";

export async function POST() {
  const stripe = stripeClient();
  const priceId = process.env.STRIPE_PRICE_ID!;
  const baseUrl = process.env.APP_BASE_URL!;
  if (!priceId || !baseUrl) return NextResponse.json({ error: "Missing STRIPE_PRICE_ID or APP_BASE_URL" }, { status: 500 });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/order/success`,
    cancel_url: `${baseUrl}/buy`,
    shipping_address_collection: { allowed_countries: ["AU"] },
    allow_promotion_codes: true,
    metadata: { product: "carascan_plate", sku: "CARASCAN_60x90" }
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
