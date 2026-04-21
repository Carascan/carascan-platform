import { getDefaultPlateSpec, getHoleCenters } from "./plate";

export type BuildPlateSvgInput = {
  identifier: string;
  qrImageHref: string;
  logoSvgMarkup?: string;
  logoImageHref?: string;
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

function buildRivetMarkerCrosshair(x: number, y: number, size = 2.4): string {
  const half = size / 2;

  return `
    <line x1="${x - half}" y1="${y}" x2="${x + half}" y2="${y}" />
    <line x1="${x}" y1="${y - half}" x2="${x}" y2="${y + half}" />`;
}

export function buildPlateSvg({
  identifier,
  qrImageHref,
  logoSvgMarkup,
  logoImageHref,
}: BuildPlateSvgInput): string {
  const spec = getDefaultPlateSpec();

  // Locked logo geometry
  const logoWidth = 84;
  const logoHeight = 9.2;
  const logoCenterX = spec.widthMm / 2;
  const logoCenterY = 16;
  const logoX = logoCenterX - logoWidth / 2;
  const logoY = logoCenterY - logoHeight / 2;
  const logoBottom = logoY + logoHeight;

  // Identifier geometry
  const textX = spec.widthMm / 2;
  const textFontSize = 4.2;
  const textBottom = spec.heightMm - 2;
  const textY = textBottom - textFontSize / 2;
  const identifierTop = textBottom - textFontSize;

  // QR geometry
  const gapBelowLogo = 3.0;
  const gapAboveIdentifier = 2.0;

  const qrTop = logoBottom + gapBelowLogo;
  const qrBottom = identifierTop - gapAboveIdentifier;
  const qrSize = qrBottom - qrTop;

  const qrCenterX = spec.widthMm / 2;
  const qrX = qrCenterX - qrSize / 2;
  const qrY = qrTop;

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
    <g id="LOGO_IMAGE"></g>`;

  const qrMarkup = `
    <g id="QR_IMAGE">
      <image
        x="${qrX}"
        y="${qrY}"
        width="${qrSize}"
        height="${qrSize}"
        preserveAspectRatio="none"
        href="${esc(qrImageHref)}"
      />
    </g>`;

  const rivetMarkers = getHoleCenters(spec)
    .map(({ x, y }) => buildRivetMarkerCrosshair(x, y))
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${spec.widthMm}mm"
  height="${spec.heightMm}mm"
  viewBox="0 0 ${spec.widthMm} ${spec.heightMm}"
>
  <g
    id="OUTLINE_REFERENCE"
    fill="none"
    stroke="black"
    stroke-width="0.1"
    vector-effect="non-scaling-stroke"
  >
    <rect
      x="0"
      y="0"
      width="${spec.widthMm}"
      height="${spec.heightMm}"
      rx="${spec.cornerRadiusMm}"
      ry="${spec.cornerRadiusMm}"
    />
  </g>

  <g id="PLATE_CONTENT">
    ${logoMarkup}
    ${qrMarkup}

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
    </g>
  </g>

  <g
  id="RIVET_MARKERS"
  fill="none"
  stroke="blue"
  stroke-width="0.15"
  stroke-linecap="square"
  vector-effect="non-scaling-stroke"
>
    ${rivetMarkers}
  </g>
</svg>`;
}