function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const ENV = {
  APP_BASE_URL: requireEnv("APP_BASE_URL"),
  FROM_EMAIL: requireEnv("FROM_EMAIL"),
  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  STRIPE_WEBHOOK_SECRET: requireEnv("STRIPE_WEBHOOK_SECRET"),

  ADMIN_ACTION_SECRET: optionalEnv("ADMIN_ACTION_SECRET"),

  MANUFACTURING_EMAIL: requireEnv("MANUFACTURING_EMAIL"),

  STRIPE_PRICE_ID_PLATE:
    optionalEnv("STRIPE_PRICE_ID_PLATE") ?? optionalEnv("STRIPE_PRICE_ID"),
  STRIPE_PRICE_ID_SUBSCRIPTION_3: optionalEnv("STRIPE_PRICE_ID_SUBSCRIPTION_3"),
  STRIPE_PRICE_ID_SUBSCRIPTION_10: optionalEnv("STRIPE_PRICE_ID_SUBSCRIPTION_10"),
  STRIPE_PRICE_ID_SHIPPING_STANDARD: optionalEnv("STRIPE_PRICE_ID_SHIPPING_STANDARD"),
  STRIPE_PRICE_ID_SHIPPING_EXPRESS: optionalEnv("STRIPE_PRICE_ID_SHIPPING_EXPRESS"),

  PLATE_ASSETS_BUCKET: optionalEnv("PLATE_ASSETS_BUCKET") ?? "assets",
  PLATE_LOGO_SVG_URL: optionalEnv("PLATE_LOGO_SVG_URL"),
  GOOGLE_MAPS_API_KEY: optionalEnv("GOOGLE_MAPS_API_KEY"),

  SMS_PROVIDER: (optionalEnv("SMS_PROVIDER") ?? "twilio").toLowerCase(),
  TWILIO_ACCOUNT_SID: optionalEnv("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: optionalEnv("TWILIO_AUTH_TOKEN"),
  TWILIO_FROM_NUMBER: optionalEnv("TWILIO_FROM_NUMBER"),
};

export function requireAdminActionSecret(): string {
  const value = ENV.ADMIN_ACTION_SECRET?.trim();

  if (!value) {
    throw new Error("Missing required environment variable: ADMIN_ACTION_SECRET");
  }

  return value;
}

export function requireStripePriceIdPlate(): string {
  const value = ENV.STRIPE_PRICE_ID_PLATE?.trim();

  if (!value) {
    throw new Error(
      "Missing required environment variable: STRIPE_PRICE_ID_PLATE (or STRIPE_PRICE_ID)"
    );
  }

  return value;
}

export function requireStripePriceIdSubscription3(): string {
  const value = ENV.STRIPE_PRICE_ID_SUBSCRIPTION_3?.trim();

  if (!value) {
    throw new Error(
      "Missing required environment variable: STRIPE_PRICE_ID_SUBSCRIPTION_3"
    );
  }

  return value;
}

export function requireStripePriceIdSubscription10(): string {
  const value = ENV.STRIPE_PRICE_ID_SUBSCRIPTION_10?.trim();

  if (!value) {
    throw new Error(
      "Missing required environment variable: STRIPE_PRICE_ID_SUBSCRIPTION_10"
    );
  }

  return value;
}

export function requireStripePriceIdShippingStandard(): string {
  const value = ENV.STRIPE_PRICE_ID_SHIPPING_STANDARD?.trim();

  if (!value) {
    throw new Error(
      "Missing required environment variable: STRIPE_PRICE_ID_SHIPPING_STANDARD"
    );
  }

  return value;
}

export function requireStripePriceIdShippingExpress(): string {
  const value = ENV.STRIPE_PRICE_ID_SHIPPING_EXPRESS?.trim();

  if (!value) {
    throw new Error(
      "Missing required environment variable: STRIPE_PRICE_ID_SHIPPING_EXPRESS"
    );
  }

  return value;
}

export function getSmsDebugEnv() {
  return {
    provider: ENV.SMS_PROVIDER,
    hasTwilioAccountSid: !!ENV.TWILIO_ACCOUNT_SID,
    hasTwilioAuthToken: !!ENV.TWILIO_AUTH_TOKEN,
    twilioFromNumber: ENV.TWILIO_FROM_NUMBER ?? "",
  };
}