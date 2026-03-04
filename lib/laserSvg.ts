// lib/laserSvg.ts

function esc(s: string) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] as string));
}

/**
 * Takes a raw SVG string and tries to extract:
 * - viewBox width/height
 * - inner content (everything inside the <svg> ... </svg>)
 *
 * If parsing fails, returns null and we just omit the logo.
 */
function parseSvg(svgText: string): { inner: string; vbW: number; vbH: number } | null {
  if (!svgText) return null;

  const svgMatch = svgText.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
  if (!svgMatch) return null;

  const inner = svgMatch[1];

  // Try viewBox first
  const viewBoxMatch = svgText.match(/viewBox\s*=\s*"([^"]+)"/i);
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      const vbW = parts[2];
      const vbH = parts[3];
      if (vbW > 0 && vbH > 0) return { inner, vbW, vbH };
    }
  }

  // Fallback to width/height attributes (may include units)
  const wMatch = svgText.match(/width\s*=\s*"([^"]+)"/i);
  const hMatch = svgText.match(/height\s*=\s*"([^"]+)"/i);

  const toNum = (v?: string) => {
    if (!v) return NaN;
    const n = Number(String(v).replace(/[a-z%]/gi, ""));
    return Number.isFinite(n) ? n : NaN;
  };

  const w = toNum(wMatch?.[1]);
  const h = toNum(hMatch?.[1]);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return { inner, vbW: w, vbH: h };
  }

  return null;
}

export function buildPlateSvg(params: {
  slug: string;
  qrDataUrl: string; // PNG data URL embedded into SVG

  // plate
  plateWidthMm: number;     // 90
  plateHeightMm: number;    // 90
  cornerRadiusMm?: number;  // 3
  marginInsetMm?: number;   // 5
  holeDiameterMm: number;   // 4.2

  // geometry (centres + sizes)
  logoCenterX: number;      // 45
  logoCenterY: number;      // 16
  logoWidthMm: number;      // 84
  logoHeightMm: number;     // 9.2
  qrCenterX: number;        // 45
  qrCenterY: number;        // 51
  qrSizeMm: number;         // 50
  idCenterX: number;        // 45
  idCenterY: number;        // 82
  idFontSizeMm: number;     // 4.2

  identifier: string;       // "CSN-XXXX"
  logoSvgText?: string;     // raw SVG text to embed
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

  // LOGO box (top-left for <g> placement)
  const logoX = params.logoCenterX - params.logoWidthMm / 2;
  const logoY = params.logoCenterY - params.logoHeightMm / 2;

  // QR box
  const qrX = params.qrCenterX - params.qrSizeMm / 2;
  const qrY = params.qrCenterY - params.qrSizeMm / 2;

  // Identifier (text baseline: SVG uses baseline, not centre)
  // We'll approximate by nudging baseline down a little.
  const idBaselineY = params.idCenterY + (params.idFontSizeMm * 0.35);

  const identifier = esc(params.identifier);
  const titleSlug = esc(params.slug);

  // Embed logo SVG if we can parse it
  let logoBlock = "";
  const parsed = params.logoSvgText ? parseSvg(params.logoSvgText) : null;
  if (parsed) {
    // scale parsed viewBox -> requested logo size in mm
    const sx = params.logoWidthMm / parsed.vbW;
    const sy = params.logoHeightMm / parsed.vbH;

    // IMPORTANT: wrap in its own <g>, keep everything black
    // (LightBurn likes simple paths; if the logo has fills/strokes it will keep them)
    logoBlock = `
  <g id="LOGO_SVG" transform="translate(${logoX} ${logoY}) scale(${sx} ${sy})">
    ${parsed.inner}
  </g>`;
  }

  // Optional centre crosshair (helpful for jigs)
  const crosshair = `
  <g id="CENTER_CROSSHAIR" stroke="black" stroke-width="0.1" fill="none">
    <line x1="${W / 2}" y1="${H / 2 - 3}" x2="${W / 2}" y2="${H / 2 + 3}" />
    <line x1="${W / 2 - 3}" y1="${H / 2}" x2="${W / 2 + 3}" y2="${H / 2}" />
  </g>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${W}mm" height="${H}mm"
     viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${titleSlug}</title>

  <!-- OUTLINE -->
  <g id="OUTLINE" fill="none" stroke="black" stroke-width="0.1">
    <rect x="0.05" y="0.05" width="${W - 0.1}" height="${H - 0.1}" rx="${R}" ry="${R}" />
  </g>

  <!-- HOLES -->
  <g id="HOLES" fill="none" stroke="black" stroke-width="0.1">
    ${holes.map(h => `<circle cx="${h.cx}" cy="${h.cy}" r="${holeD / 2}" />`).join("\n    ")}
  </g>

  ${crosshair}

  ${logoBlock}

  <!-- QR (embedded PNG data URL) -->
  <g id="QR">
    <image x="${qrX}" y="${qrY}" width="${params.qrSizeMm}" height="${params.qrSizeMm}" href="${params.qrDataUrl}" />
  </g>

  <!-- IDENTIFIER -->
  <g id="IDENTIFIER" fill="black">
    <text x="${params.idCenterX}" y="${idBaselineY}"
          font-size="${params.idFontSizeMm}"
          text-anchor="middle"
          font-family="Arial, sans-serif">${identifier}</text>
  </g>

</svg>`;
}