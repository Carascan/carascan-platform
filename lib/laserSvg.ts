import { getDefaultPlateSpec, getHoleCenters } from "./plate";

export type BuildPlateSvgInput = {
  identifier: string;
  qrImageHref: string;
  mountingHoles: boolean;
  logoSvgMarkup?: string;
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
  includeCrosshair = false,
}: BuildPlateSvgInput): string {
  const spec = getDefaultPlateSpec();
  const holes = getHoleCenters(spec);

  const logoWidth = 84;
  const logoHeight = 9.2;
  const logoCenterX = 45;
  const logoCenterY = 16;
  const logoX = logoCenterX - logoWidth / 2;
  const logoY = logoCenterY - logoHeight / 2;

  const qrSize = 50;
  const qrCenterX = 45;
  const qrCenterY = 51;
  const qrX = qrCenterX - qrSize / 2;
  const qrY = qrCenterY - qrSize / 2;

  const textX = 45;
  const textY = 82;
  const textFontSize = 4.2;

  const holeMarkup = mountingHoles
    ? `
  <g id="HOLES" fill="none" stroke="black" stroke-width="0.3">
    ${holes
      .map(
        (h) =>
          `<circle cx="${h.x}" cy="${h.y}" r="${spec.holeDiameterMm / 2}" />`,
      )
      .join("\n    ")}
  </g>`
    : "";

  const logoMarkup = logoSvgMarkup
    ? `
  <g id="LOGO_SVG">
    <svg
      x="${logoX}"
      y="${logoY}"
      width="${logoWidth}"
      height="${logoHeight}"
      viewBox="0 0 84 9.2"
      overflow="visible"
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
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${spec.widthMm}mm"
  height="${spec.heightMm}mm"
  viewBox="0 0 ${spec.widthMm} ${spec.heightMm}"
>
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