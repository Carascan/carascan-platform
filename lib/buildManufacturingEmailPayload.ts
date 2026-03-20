export type ManufacturingEmailPayload = {
  to: string | string[];
  identifier: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracyM?: number | null;
};

export function buildManufacturingEmailPayload(input: {
  to: string | string[];
  identifier: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracyM?: number | null;
}): ManufacturingEmailPayload {
  return {
    to: input.to,
    identifier: input.identifier,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    accuracyM: input.accuracyM ?? null,
  };
}