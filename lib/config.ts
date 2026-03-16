export const APP_BASE_URL = "https://carascan.com.au";

export const CARASCAN = {
  brand: "Carascan",
  identifierPrefix: "CSN",
  plate: {
    widthMm: 90,
    heightMm: 90,
    cornerRadiusMm: 3,
    defaultHoleDiameterMm: 5.2,
    defaultHoleInsetMm: 5,
  },
  qr: {
    pngSizePx: 600,
    previewErrorCorrectionLevel: "M" as const,
    productionErrorCorrectionLevel: "H" as const,
    previewMargin: 1,
    productionMargin: 4,
  },
};