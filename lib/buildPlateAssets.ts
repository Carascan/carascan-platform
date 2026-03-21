import { buildPlateUrl, getDefaultPlateSpec } from "./plate";
import { generateQrBuffer, generateQrDataUrl } from "./generateQr";
import { buildPlateSvg } from "./laserSvg";

export type MountingMethod = "rivet" | "adhesive";

export type BuildPlateAssetsInput = {
  identifier: string;
  slug: string;
  mountingMethod?: MountingMethod;
  mountingHoles?: boolean;
  logoSvgMarkup?: string;
  logoImageHref?: string;
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

function resolveMountingMethod(
  input: Pick<BuildPlateAssetsInput, "mountingMethod" | "mountingHoles">
): MountingMethod {
  if (input.mountingMethod === "adhesive") return "adhesive";
  if (input.mountingMethod === "rivet") return "rivet";
  if (typeof input.mountingHoles === "boolean") {
    return input.mountingHoles ? "rivet" : "adhesive";
  }
  return "rivet";
}

export async function buildPlateAssets(
  input: BuildPlateAssetsInput
): Promise<BuildPlateAssetsResult> {
  const plateUrl = buildPlateUrl(input.slug);
  const mountingMethod = resolveMountingMethod(input);
  const mountingHoles = mountingMethod === "rivet";

  const qrPngBuffer = await generateQrBuffer(plateUrl, {
    mode: "production",
    margin: 0,
    transparentBackground: true,
  });

  const qrDataUrl = await generateQrDataUrl(plateUrl, {
    mode: "production",
    margin: 0,
    transparentBackground: true,
  });

  const plateSvg = buildPlateSvg({
    identifier: input.identifier,
    qrImageHref: qrDataUrl,
    mountingHoles,
    logoSvgMarkup: input.logoSvgMarkup,
    logoImageHref: input.logoImageHref,
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
      mountingMethod,
      mountingHoles,
      plateSizeMm: {
        width: 90,
        height: 90,
      },
      qr: {
        type: "png-no-quiet-zone",
        margin: 0,
      },
      generatedAt: new Date().toISOString(),
    },
  };
}