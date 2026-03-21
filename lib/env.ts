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
  ADMIN_ACTION_SECRET: requireEnv("ADMIN_ACTION_SECRET"),

  MANUFACTURING_EMAIL: requireEnv("MANUFACTURING_EMAIL"),

  STRIPE_PRICE_ID_PLATE:
    optionalEnv("STRIPE_PRICE_ID_PLATE") ?? optionalEnv("STRIPE_PRICE_ID"),
  STRIPE_PRICE_ID_SUBSCRIPTION_3: optionalEnv("STRIPE_PRICE_ID_SUBSCRIPTION_3"),
  STRIPE_PRICE_ID_SUBSCRIPTION_10: optionalEnv("STRIPE_PRICE_ID_SUBSCRIPTION_10"),

  PLATE_ASSETS_BUCKET: optionalEnv("PLATE_ASSETS_BUCKET") ?? "assets",
  PLATE_LOGO_SVG_URL: optionalEnv("PLATE_LOGO_SVG_URL"),
  GOOGLE_MAPS_API_KEY: optionalEnv("GOOGLE_MAPS_API_KEY"),
};

if (!ENV.STRIPE_PRICE_ID_PLATE) {
  throw new Error(
    "Missing required environment variable: STRIPE_PRICE_ID_PLATE (or STRIPE_PRICE_ID)"
  );
}

if (!ENV.STRIPE_PRICE_ID_SUBSCRIPTION_3) {
  throw new Error(
    "Missing required environment variable: STRIPE_PRICE_ID_SUBSCRIPTION_3"
  );
}

if (!ENV.STRIPE_PRICE_ID_SUBSCRIPTION_10) {
  throw new Error(
    "Missing required environment variable: STRIPE_PRICE_ID_SUBSCRIPTION_10"
  );
}