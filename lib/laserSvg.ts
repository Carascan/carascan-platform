// lib/laserSvg.ts

function esc(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c] as string));
}

export function buildPlateSvg(params: {
  slug: string;

  // required assets
  qrDataUrl: string;          // PNG data URL

  // plate geometry (from DB design)
  plateWidthMm: number;       // 90
  plateHeightMm: number;      // 90
  cornerRadiusMm?: number;    // 3
  marginInsetMm?: number;     // 5
  holeDiameterMm: number;     // 4.2
  qrSizeMm: number;           // 55 (your latest)

  // content
  identifier: string;         // e.g. "CSN-0000123"

  // optional text placeholder (use "" if engraving logo separately in LightBurn)
  logoText?: string;          // e.g. "CARASCAN"
  includeCrosshair?: boolean; // default true
}) {
  const W = params.plateWidthMm;
  const H = params.plateHeightMm;
  const R = params.cornerRadiusMm ?? 3;
  const inset = params.marginInsetMm ?? 5;
  const holeD = params.holeDiameterMm;

  // Hole centres at inset corners
  const holes = [
    { cx: inset,     cy: inset     },
    { cx: W - inset, cy: inset     },
    { cx: inset,     cy: H - inset },
    { cx: W - inset, cy: H - inset },
  ];

  // Content
  const identifier = esc(params.identifier);
  const titleSlug = esc(params.slug);
  const logoText = esc(params.logoText ?? "CARASCAN");

  // QR sizing & placement
  // IMPORTANT: Must clear bottom hole centres at y=H-inset (85).
  // Keep QR bottom well above ~83 to avoid overlap with circles and engraving.
  const qrS = params.qrSizeMm;
  const qrX = (W - qrS) / 2;
  const qrY = 15; // QR occupies y=15..70 when qrS=55 (clears bottom holes at y=85)

  // Logo placement (above QR)
  const logoCenterX = W / 2;
  const logoBaselineY = 11; // top band, stays away from top holes at y=5

  // Identifier placement (between bottom holes)
  const idCenterX = W / 2;
  const idBaselineY = 80; // readable and safely above bottom edge/holes

  // Optional center crosshair (useful for jig alignment)
  const includeCrosshair = params.includeCrosshair ?? true;
  const crosshair = includeCrosshair ? `
  <g id="CENTER_CROSSHAIR" stroke="black" stroke-width="0.1" fill="none">
    <line x1="${W / 2}" y1="${H / 2 - 3}" x2="${W / 2}" y2="${H / 2 + 3}" />
    <line x1="${W / 2 - 3}" y1="${H / 2}" x2="${W / 2 + 3}" y2="${H / 2}" />
  </g>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${titleSlug}</title>

  <!-- OUTLINE -->
  <g id="OUTLINE_R${R}" fill="none" stroke="black" stroke-width="0.1">
    <rect x="0.05" y="0.05" width="${W - 0.1}" height="${H - 0.1}" rx="${R}" ry="${R}" />
  </g>

  <!-- HOLE MARKS (Ø${holeD}) -->
  <g id="HOLE_MARKS_D${holeD}" fill="none" stroke="black" stroke-width="0.1">
    ${holes.map(h => `<circle cx="${h.cx}" cy="${h.cy}" r="${holeD / 2}" />`).join("\n    ")}
  </g>

  ${crosshair}

  <!-- LOGO (text placeholder) -->
  ${logoText ? `
  <g id="LOGO_TEXT" fill="black">
    <text x="${logoCenterX}" y="${logoBaselineY}"
      font-size="6"
      text-anchor="middle"
      font-family="Arial, sans-serif"
      letter-spacing="1">${logoText}</text>
  </g>` : ""}

  <!-- QR (raster PNG data URL) -->
  <g id="QR_RASTER">
    <image x="${qrX}" y="${qrY}" width="${qrS}" height="${qrS}" href="${params.qrDataUrl}" />
  </g>

  <!-- IDENTIFIER -->
  <g id="IDENTIFIER" fill="black">
    <text x="${idCenterX}" y="${idBaselineY}"
      font-size="5"
      text-anchor="middle"
      font-family="Arial, sans-serif">${identifier}</text>
  </g>

</svg>`;
}