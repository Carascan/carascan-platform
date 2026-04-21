export type ShippingLabelSvgInput = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  logoUrl?: string;
};

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildShippingLabelSvg({
  name,
  line1,
  line2,
  city,
  state,
  postcode,
  logoUrl,
}: ShippingLabelSvgInput): string {
  const widthMm = 62;
  const heightMm = 100;

  const centerX = widthMm / 2;

  const safeName = esc(name.trim());
  const safeLine1 = esc(line1.trim());
  const safeLine2 = esc((line2 ?? "").trim());
  const safeCityStatePostcode = esc(
    [city.trim(), state.trim(), postcode.trim()].filter(Boolean).join(" ")
  );
  const safeLogoUrl = logoUrl ? esc(logoUrl) : "";

  const hasLine2 = Boolean(line2 && line2.trim());

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${widthMm}mm"
  height="${heightMm}mm"
  viewBox="0 0 ${widthMm} ${heightMm}"
>
  <rect x="0" y="0" width="${widthMm}" height="${heightMm}" fill="white" />

  ${
    safeLogoUrl
      ? `
  <image
    href="${safeLogoUrl}"
    x="${centerX - 20}"
    y="6"
    width="40"
    height="6"
    preserveAspectRatio="xMidYMid meet"
  />`
      : ""
  }

  <text
    x="${centerX}"
    y="24"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="5.2"
    font-weight="700"
    fill="black"
  >${safeName}</text>

  <text
    x="${centerX}"
    y="38"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="4"
    fill="black"
  >${safeLine1}</text>

  ${
    hasLine2
      ? `
  <text
    x="${centerX}"
    y="48"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="4"
    fill="black"
  >${safeLine2}</text>`
      : ""
  }

  <text
    x="${centerX}"
    y="${hasLine2 ? 60 : 50}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="4.4"
    font-weight="700"
    fill="black"
  >${safeCityStatePostcode}</text>
</svg>`;
}