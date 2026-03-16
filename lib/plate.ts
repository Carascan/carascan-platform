import { APP_BASE_URL, CARASCAN } from "./config";

export type PlateKind = "caravan";

export type PlateSpec = {
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  holeDiameterMm: number;
  holeInsetMm: number;
};

export type PlateRecordLike = {
  identifier: string;
  slug: string;
  mountingHoles?: boolean;
};

export function formatIdentifier(sequence: number): string {
  return `${CARASCAN.identifierPrefix}-${String(sequence).padStart(6, "0")}`;
}

export function buildPlateUrl(slug: string): string {
  return `${APP_BASE_URL}/p/${encodeURIComponent(slug)}`;
}

export function buildSetupUrl(token: string): string {
  return `${APP_BASE_URL}/setup/${encodeURIComponent(token)}`;
}

export function getDefaultPlateSpec(): PlateSpec {
  return {
    widthMm: CARASCAN.plate.widthMm,
    heightMm: CARASCAN.plate.heightMm,
    cornerRadiusMm: CARASCAN.plate.cornerRadiusMm,
    holeDiameterMm: CARASCAN.plate.defaultHoleDiameterMm,
    holeInsetMm: CARASCAN.plate.defaultHoleInsetMm,
  };
}

export function getHoleCenters(spec = getDefaultPlateSpec()) {
  const x1 = spec.holeInsetMm;
  const y1 = spec.holeInsetMm;
  const x2 = spec.widthMm - spec.holeInsetMm;
  const y2 = spec.heightMm - spec.holeInsetMm;

  return [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x1, y: y2 },
    { x: x2, y: y2 },
  ];
}