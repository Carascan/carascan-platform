export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function getPlatePublicUrl(slug: string) {
  return `${getBaseUrl()}/p/${slug}`;
}