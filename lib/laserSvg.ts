function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c] as string));
}

export function buildPlateSvg(params: {slug: string;
  qrDataUrl: string;
}) {
  const W = 90;
  const H = 90;

  const QR_SIZE = 55;
  const QR_X = 17.5;
  const QR_Y = 30;

  const CSN_BASELINE_Y = 85;
  const CSN_CENTER_X = 25;

  const csn = esc(params.slug || "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${W}mm"
     height="${H}mm"
     viewBox="0 0 ${W} ${H}">
  <title>Carascan Plate ${csn}</title>

  <g id="CSN_VECTOR" fill="black">
    <text x="${CSN_CENTER_X}"
          y="${CSN_BASELINE_Y}"
          font-size="5"
          text-anchor="middle"
          font-family="Arial, sans-serif">${csn}</text>
  </g>

  <g id="QR_RASTER">
    <image x="${QR_X}"
           y="${QR_Y}"
           width="${QR_SIZE}"
           height="${QR_SIZE}"
           href="${params.qrDataUrl}" />
  </g>
</svg>`;
}
