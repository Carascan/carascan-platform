// lib/laserSvg.ts

function esc(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
      c
    ] as string)
  );
}

function stripXmlProlog(svg: string) {
  return (svg || "").replace(/<\?xml[\s\S]*?\?>/gi, "").trim();
}

function extractViewBox(svg: string): string | null {
  const m = svg.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

function extractInnerSvg(svg: string): string {
  // Remove outer <svg ...> ... </svg> wrapper if present
  const s = stripXmlProlog(svg);
  const open = s.match(/<svg\b[^>]*>/i);
  const closeIndex = s.toLowerCase().lastIndexOf("</svg>");
  if (!open || closeIndex < 0) return s; // not a wrapped svg, just return as-is
  const start = open.index! + open[0].length;
  return s.slice(start, closeIndex).trim();
}

export function buildPlateSvg(params: {
  slug: string;

  // required asset
  qrDataUrl: string; // PNG data URL

  // plate geometry (from DB design)
  plateWidthMm: number; // 90
  plateHeightMm: number; // 90
  cornerRadiusMm?: number; // 3
  marginInsetMm?: number; // 5
  holeDiameterMm: number; // 4.2
  qrSizeMm: number; // 55

  // content
  identifier: string; // e.g. "CSN-0000123"

  // EMBED LOGO (vector)
  // Provide the raw SVG text (from URL fetch). We'll extract its viewBox + inner content.
  logoSvgRaw?: string | null;

  // optional
  includeCrosshair?: boolean;
}) {
  const W = params.plateWidthMm;
  const H = params.plateHeightMm;
  const R = params.cornerRadiusMm ?? 3;
  const inset = params.marginInsetMm ?? 5;
  const holeD = params.holeDiameterMm;

  // Hole centres at inset corners
  const holes = [
    { cx: inset, cy: inset },
    { cx: W - inset, cy: inset },
    { cx: inset, cy: H - inset },
    { cx: W - inset, cy: H - inset },
  ];

  // === Layout rules (locked physical plate intent) ===
  // Plate 90x90, inset 5mm, QR 55mm centred.
  // Logo sits above QR in the top band.
  // Identifier sits between bottom holes along bottom band.
  const qrS = params.qrSizeMm;
  const qrX = (W - qrS) / 2;
  const qrY = 22; // puts QR around mid, leaving top band for logo and bottom band for ID

  // Logo target size (your current): 55mm wide x 6mm high
  const logoW = 55;
  const logoH = 6;
  const logoX = (W - logoW) / 2;
  const logoY = 12; // top band position

  // Identifier band
  const idCenterX = W / 2;
  const idBaselineY = 85; // between bottom holes, inside safe zone
  const identifier = esc(params.identifier);
  const titleSlug = esc(params.slug);

  // Optional crosshair for jig alignment
  const crosshair = params.includeCrosshair
    ? `
  <g id="CENTER_CROSSHAIR" stroke="black" stroke-width="0.1" fill="none">
    <line x1="${W / 2}" y1="${H / 2 - 3}" x2="${W / 2}" y2="${H / 2 + 3}" />
    <line x1="${W / 2 - 3}" y1="${H / 2}" x2="${W / 2 + 3}" y2="${H / 2}" />
  </g>`
    : "";

  // Embed logo SVG (vector)
  let logoBlock = "";
  if (params.logoSvgRaw) {
    const raw = stripXmlProlog(params.logoSvgRaw);
    const vb = extractViewBox(raw) ?? "0 0 100 10"; // fallback
    const inner = extractInnerSvg(raw);

    // We embed as a nested <svg> so we don't have to guess scale transforms.
    // This preserves the logo’s vector fidelity.
    logoBlock = `
  <g id="LOGO_VECTOR">
    <svg x="${logoX}" y="${logoY}" width="${logoW}" height="${logoH}" viewBox="${esc(
      vb
    )}" preserveAspectRatio="xMidYMid meet">
      ${inner}
    </svg>
  </g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${titleSlug}</title>

  <!-- OUTLINE (R corners) -->
  <g id="OUTLINE_R${R}" fill="none" stroke="black" stroke-width="0.1">
    <rect x="0.05" y="0.05" width="${W - 0.1}" height="${H - 0.1}" rx="${R}" ry="${R}" />
  </g>

  <!-- HOLE MARKS (Ø${holeD}) -->
  <g id="HOLE_MARKS_D${holeD}" fill="none" stroke="black" stroke-width="0.1">
    ${holes
      .map((h) => `<circle cx="${h.cx}" cy="${h.cy}" r="${holeD / 2}" />`)
      .join("\n    ")}
  </g>

  ${crosshair}

  ${logoBlock}

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