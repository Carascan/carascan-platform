import { buildPlateUrl, getDefaultPlateSpec } from "./plate";
import { generateQrBuffer, generateQrDataUrl } from "./generateQr";
import { buildPlateSvg } from "./laserSvg";

export type BuildPlateAssetsInput = {
  identifier: string;
  slug: string;
  mountingHoles: boolean;
  logoSvgMarkup?: string;
};

export type BuildPlateAssetsResult = {
  identifier: string;
  slug: string;
  plateUrl: string;
  spec: ReturnType<typeof getDefaultPlateSpec>;
  qrPngBuffer: Buffer;
  qrDataUrl: string;
  plateSvg: string;
  metadata: Record<string, unknown>;
};

export async function buildPlateAssets(
  input: BuildPlateAssetsInput,
): Promise<BuildPlateAssetsResult> {
  const plateUrl = buildPlateUrl(input.slug);

  const qrPngBuffer = await generateQrBuffer(plateUrl, {
    mode: "production",
    transparentBackground: true,
  });

  const qrDataUrl = await generateQrDataUrl(plateUrl, {
    mode: "production",
    transparentBackground: true,
  });

  const plateSvg = buildPlateSvg({
    identifier: input.identifier,
    qrImageHref: qrDataUrl,
    mountingHoles: input.mountingHoles,
    logoSvgMarkup: input.logoSvgMarkup,
  });

  return {
    identifier: input.identifier,
    slug: input.slug,
    plateUrl,
    spec: getDefaultPlateSpec(),
    qrPngBuffer,
    qrDataUrl,
    plateSvg,
    metadata: {
      identifier: input.identifier,
      slug: input.slug,
      plateUrl,
      mountingHoles: input.mountingHoles,
      plateSizeMm: {
        width: 90,
        height: 90,
      },
      generatedAt: new Date().toISOString(),
    },
  };
}