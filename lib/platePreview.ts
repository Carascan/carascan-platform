import { buildPlateUrl, getDefaultPlateSpec } from "./plate";
import { generateQrDataUrl } from "./generateQr";

export type PlatePreviewInput = {
  slug: string;
  identifier: string;
  logoUrl?: string;
};

export type PlatePreviewData = {
  identifier: string;
  plateUrl: string;
  qrDataUrl: string;
  logoUrl?: string;
  spec: ReturnType<typeof getDefaultPlateSpec>;
};

export async function buildPlatePreviewData(
  input: PlatePreviewInput
): Promise<PlatePreviewData> {
  const plateUrl = buildPlateUrl(input.slug);

  const qrDataUrl = await generateQrDataUrl(plateUrl, {
    mode: "preview",
    transparentBackground: true,
  });

  return {
    identifier: input.identifier,
    plateUrl,
    qrDataUrl,
    logoUrl: input.logoUrl,
    spec: getDefaultPlateSpec(),
  };
}