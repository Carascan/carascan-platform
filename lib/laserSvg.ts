// lib/laserSvg.ts

function esc(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

/**
 * Extracts inner SVG content + viewBox (if any) so we can embed/scale it.
 * This keeps the final plate SVG fully self-contained (good for LightBurn copy/paste nesting).
 */
function parseSvgFragment(svgText: string): { inner: string; viewBox: { w: number; h: number } | null } {
  const text = (svgText ?? "").trim();
  if (!text) return { inner: "", viewBox: null };

  // Grab outer <svg ...>...</svg>
  const svgMatch = text.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
  const inner = svgMatch ? svgMatch[1] : text;

  // Try viewBox first
  const vbMatch = text.match(/viewBox\s*=\s*["']([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)\s+([\d.\-]+)["']/i);
  if (vbMatch) {
    const w = Number(vbMatch[3]);
    const h = Number(vbMatch[4]);
    if (isFinite(w) && isFinite(h) && w > 0 && h > 0) return { inner, viewBox: { w, h } };
  }

  // Fallback: width/height (can be "84", "84mm", etc.)
  const wMatch = text.match(/\bwidth\s*=\s*["']([\d.]+)(mm)?["']/i);
  const hMatch = text.match(/\bheight\s*=\s*["']([\d.]+)(mm)?["']/i);
  const w = wMatch ? Number(wMatch[1]) : NaN;
  const h = hMatch ? Number(hMatch[1]) : NaN;
  if (isFinite(w) && isFinite(h) && w > 0 && h > 0) return { inner, viewBox: { w, h } };

  return { inner, viewBox: null };
}

export function buildPlateSvg(params: {
  slug: string;

  // Embedded PNG data URL for QR
  qrDataUrl: string;

  // Plate geometry
  plateWidthMm: number; // 90
  plateHeightMm: number; // 90
  cornerRadiusMm?: number; // 3
  marginInsetMm?: number; // 5
  holeDiameterMm: number; // 4.2

  // Layout (Option B centres + sizes)
  logoCenterX: number; // 45
  logoCenterY: number; // 16
  logoWidthMm: number; // 84
  logoHeightMm: number; // 9.2
  logoSvgText?: string; // SVG text fetched from Supabase

  qrCenterX: number; // 45
  qrCenterY: number; // 51
  qrSizeMm: number; // 50

  idCenterX: number; // 45
  idCenterY: number; // 82
  idFontSizeMm: number; // 4.2
  identifier: string; // e.g. CSN-XXXX

  // Optional alignment aid
  includeCrosshair?: boolean; // default true
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

  // Optional crosshair at centre (useful for jigs)
  const crosshair =
    params.includeCrosshair ?? true
      ? `
  <g id="CENTER_CROSSHAIR" stroke="black" stroke-width="0.1" fill="none">
    <line x1="${W / 2}" y1="${H / 2 - 3}" x2="${W / 2}" y2="${H / 2 + 3}" />
    <line x1="${W / 2 - 3}" y1="${H / 2}" x2="${W / 2 + 3}" y2="${H / 2}" />
  </g>`
      : "";

  // Logo embed: scale logo SVG fragment into a box (logoWidthMm x logoHeightMm) centred at (logoCenterX, logoCenterY)
  let logoBlock = "";
  const logoSvgText = (params.logoSvgText ?? "").trim();
  if (logoSvgText) {
    const { inner, viewBox } = parseSvgFragment(logoSvgText);

    // If no viewBox info, we still embed but without scaling precision
    const srcW = viewBox?.w ?? params.logoWidthMm;
    const srcH = viewBox?.h ?? params.logoHeightMm;

    const targetW = params.logoWidthMm;
    const targetH = params.logoHeightMm;

    const scaleX = targetW / srcW;
    const scaleY = targetH / srcH;

    // Place top-left of target box, then scale the source into it.
    const x0 = params.logoCenterX - targetW / 2;
    const y0 = params.logoCenterY - targetH / 2;

    // Important: wrap in <g> so LightBurn keeps it vector
    logoBlock = `
  <g id="LOGO_SVG" fill="none" stroke="black" stroke-width="0.1"
     transform="translate(${x0}, ${y0}) scale(${scaleX}, ${scaleY})">
    ${inner}
  </g>`;
  }

  // QR: convert centre -> top-left for <image>
  const qrS = params.qrSizeMm;
  const qrX = params.qrCenterX - qrS / 2;
  const qrY = params.qrCenterY - qrS / 2;

  // Identifier text (centre-aligned)
  const identifier = esc(params.identifier);
  const titleSlug = esc(params.slug);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${titleSlug}</title>

  <!-- OUTLINE (R corners) -->
  <g id="OUTLINE" fill="none" stroke="black" stroke-width="0.1">
    <rect x="0.05" y="0.05" width="${W - 0.1}" height="${H - 0.1}" rx="${R}" ry="${R}" />
  </g>

  <!-- HOLE MARKS (Ø${holeD}) -->
  <g id="HOLES" fill="none" stroke="black" stroke-width="0.1">
    ${holes.map((h) => `<circle cx="${h.cx}" cy="${h.cy}" r="${holeD / 2}" />`).join("\n    ")}
  </g>

  ${crosshair}

  ${logoBlock}

  <!-- QR (embedded raster PNG data URL) -->
  <g id="QR_RASTER">
    <image x="${qrX}" y="${qrY}" width="${qrS}" height="${qrS}" href="${params.qrDataUrl}" />
  </g>

  <!-- IDENTIFIER -->
  <g id="IDENTIFIER" fill="black">
    <text x="${params.idCenterX}" y="${params.idCenterY}"
          font-size="${params.idFontSizeMm}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial, sans-serif">${identifier}</text>
  </g>

</svg>`;
}