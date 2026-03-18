import { getDefaultPlateSpec, getHoleCenters } from "./plate";

export type BuildPlateSvgInput = {
  identifier: string;
  qrImageHref: string;
  mountingHoles: boolean;
  logoSvgMarkup?: string;
  logoImageHref?: string;
  includeCrosshair?: boolean;
};

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function stripOuterSvg(svgText: string): string {
  return svgText
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "")
    .trim();
}

export function buildPlateSvg({
  identifier,
  qrImageHref,
  mountingHoles,
  logoSvgMarkup,
  logoImageHref,
  includeCrosshair = false,
}: BuildPlateSvgInput): string {
  const spec = getDefaultPlateSpec();
  const holes = getHoleCenters(spec);

  // Locked logo geometry
  const logoWidth = 84;
  const logoHeight = 9.2;
  const logoCenterX = 45;
  const logoCenterY = 16;
  const logoX = logoCenterX - logoWidth / 2;
  const logoY = logoCenterY - logoHeight / 2;
  const logoBottom = logoY + logoHeight; // 20.6

  // Identifier moved so bottom sits 2 mm from plate edge
  const textX = 45;
  const textFontSize = 4.2;
  const textBottom = spec.heightMm - 2; // 88
  const textY = textBottom - textFontSize / 2; // approx centre position
  const identifierTop = textBottom - textFontSize; // approx 83.8

  // QR fills space between logo and identifier
  const gapBelowLogo = 3.0;
  const gapAboveIdentifier = 2.0;

  const qrTop = logoBottom + gapBelowLogo; // 23.6
  const qrBottom = identifierTop - gapAboveIdentifier; // 81.8
  const qrSize = qrBottom - qrTop; // 58.2

  const qrCenterX = 45;
  const qrX = qrCenterX - qrSize / 2;
  const qrY = qrTop;

  const holeMarkup = mountingHoles
    ? `
  <g id="HOLES" fill="none" stroke="black" stroke-width="0.3">
    ${holes
      .map(
        (h) =>
          `<circle cx="${h.x}" cy="${h.y}" r="${spec.holeDiameterMm / 2}" />`
      )
      .join("\n    ")}
  </g>`
    : "";

  const logoMarkup = logoImageHref
    ? `
  <g id="LOGO_IMAGE">
    <image
      x="${logoX}"
      y="${logoY}"
      width="${logoWidth}"
      height="${logoHeight}"
      href="${esc(logoImageHref)}"
      preserveAspectRatio="xMidYMid meet"
    />
  </g>`
    : logoSvgMarkup
    ? `
  <g id="LOGO_SVG">
    <svg
      x="${logoX}"
      y="${logoY}"
      width="${logoWidth}"
      height="${logoHeight}"
      viewBox="0 0 84 9.2"
      preserveAspectRatio="xMidYMid meet"
      overflow="hidden"
    >
      ${logoSvgMarkup}
    </svg>
  </g>`
    : `
  <g id="LOGO_SVG"></g>`;

  const crosshairMarkup = includeCrosshair
    ? `
  <g id="CROSSHAIR" fill="none" stroke="red" stroke-width="0.2">
    <line
      x1="${spec.widthMm / 2}"
      y1="0"
      x2="${spec.widthMm / 2}"
      y2="${spec.heightMm}"
    />
    <line
      x1="0"
      y1="${spec.heightMm / 2}"
      x2="${spec.widthMm}"
      y2="${spec.heightMm / 2}"
    />
  </g>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${spec.widthMm}mm"
  height="${spec.heightMm}mm"
  viewBox="0 0 ${spec.widthMm} ${spec.heightMm}"
>
  <defs>
    <linearGradient id="plateGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f7f7f7" />
      <stop offset="45%" stop-color="#dfdfdf" />
      <stop offset="100%" stop-color="#cfcfcf" />
    </linearGradient>
  </defs>

  <rect
    x="0"
    y="0"
    width="${spec.widthMm}"
    height="${spec.heightMm}"
    rx="${spec.cornerRadiusMm}"
    ry="${spec.cornerRadiusMm}"
    fill="url(#plateGradient)"
  />

  <g id="OUTLINE" fill="none" stroke="black" stroke-width="0.3">
    <rect
      x="0.15"
      y="0.15"
      width="${spec.widthMm - 0.3}"
      height="${spec.heightMm - 0.3}"
      rx="${spec.cornerRadiusMm}"
      ry="${spec.cornerRadiusMm}"
    />
  </g>${holeMarkup}${logoMarkup}
  <g id="QR_RASTER">
    <image
      x="${qrX}"
      y="${qrY}"
      width="${qrSize}"
      height="${qrSize}"
      preserveAspectRatio="none"
      href="${esc(qrImageHref)}"
    />
  </g>

  <g id="IDENTIFIER">
    <text
      x="${textX}"
      y="${textY}"
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${textFontSize}"
      fill="black"
    >${esc(identifier)}</text>
  </g>${crosshairMarkup}
</svg>`;
}