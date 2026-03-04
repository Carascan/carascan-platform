// lib/laserSvg.ts

function esc(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] as string));
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

  // optional logo (if you have a data URL or want to leave it blank)
  // If you already have the logo as SVG in LightBurn, you can leave this null
  logoText?: string;          // e.g. "CARASCAN"
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

  // QR: centred horizontally, positioned to leave room for top logo and bottom ID
  // You asked QR = 55mm, keep it dominant but inside safe zone.
  const qrS = params.qrSizeMm;
  const qrX = (W - qrS) / 2;

  // These Y values keep everything inside the 5mm inset zone and avoid holes.
  // Logo band at top, ID band at bottom.
  const logoCenterX = W / 2;
  const logoBaselineY = 13;     // visual position (adjust later if you want)
  const qrY = 20;               // puts QR at y=20..75 when qrS=55
  const idCenterX = W / 2;
  const idBaselineY = 84;       // sits above bottom edge, between bottom holes

  const identifier = esc(params.identifier);
  const titleSlug = esc(params.slug);
  const logoText = esc(params.logoText ?? "CARASCAN");

  // Optional: center crosshair (useful for jig alignment in LightBurn)
  const crosshair = `
  <g id="CENTER_CROSSHAIR" stroke="black" stroke-width="0.1" fill="none">
    <line x1="${W/2}" y1="${H/2 - 3}" x2="${W/2}" y2="${H/2 + 3}" />
    <line x1="${W/2 - 3}" y1="${H/2}" x2="${W/2 + 3}" y2="${H/2}" />
  </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${titleSlug}</title>

  <!-- OUTLINE (R3 corners) -->
  <g id="OUTLINE_R${R}" fill="none" stroke="black" stroke-width="0.1">
    <rect x="0.05" y="0.05" width="${W - 0.1}" height="${H - 0.1}" rx="${R}" ry="${R}" />
  </g>

  <!-- HOLE MARKS (Ø${holeD}) -->
  <g id="HOLE_MARKS_D${holeD}" fill="none" stroke="black" stroke-width="0.1">
    ${holes.map(h => `<circle cx="${h.cx}" cy="${h.cy}" r="${holeD/2}" />`).join("\n    ")}
  </g>

  ${crosshair}

  <!-- LOGO (placeholder text). If you engrave the SVG logo separately in LightBurn, set logoText to "" -->
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