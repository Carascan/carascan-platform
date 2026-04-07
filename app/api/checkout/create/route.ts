import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";
import { ENV } from "@/lib/env";

function readEmergencyPlan(value: FormDataEntryValue | null) {
  return value === "10" ? "10" : "3";
}

function readShippingOption(value: FormDataEntryValue | null) {
  return value === "express" ? "express" : "standard";
}

export async function POST(req: Request) {
  const stripe = stripeClient();
  const formData = await req.formData();

  const emergencyPlan = readEmergencyPlan(formData.get("emergency_plan"));
  const shippingOption = readShippingOption(formData.get("shipping_option"));

  const platePriceId = ENV.STRIPE_PRICE_ID_PLATE!;
  const subscription3PriceId = ENV.STRIPE_PRICE_ID_SUBSCRIPTION_3!;
  const subscription10PriceId = ENV.STRIPE_PRICE_ID_SUBSCRIPTION_10!;
  const standardShippingRateId = ENV.STRIPE_SHIPPING_RATE_ID_STANDARD!;
  const expressShippingRateId = ENV.STRIPE_SHIPPING_RATE_ID_EXPRESS!;
  const baseUrl = ENV.APP_BASE_URL;

  const subscriptionPriceId =
    emergencyPlan === "10" ? subscription10PriceId : subscription3PriceId;

  const shippingRateId =
    shippingOption === "express"
      ? expressShippingRateId
      : standardShippingRateId;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: platePriceId, quantity: 1 },
      { price: subscriptionPriceId, quantity: 1 },
    ],
    shipping_options: [{ shipping_rate: shippingRateId }],
    success_url: `${baseUrl}/order/success`,
    cancel_url: `${baseUrl}/buy`,
    shipping_address_collection: {
      allowed_countries: ["AU"],
    },
    allow_promotion_codes: true,
    metadata: {
      product: "carascan_plate",
      sku: "CARASCAN_90x90",
      emergency_plan: emergencyPlan,
      shipping_option: shippingOption,
      shipping_rate_id: shippingRateId,
    },
    subscription_data: {
      metadata: {
        product: "carascan_plate",
        sku: "CARASCAN_90x90",
        emergency_plan: emergencyPlan,
        shipping_option: shippingOption,
        shipping_rate_id: shippingRateId,
      },
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe checkout session URL missing" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(session.url, { status: 303 });
}