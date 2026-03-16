import { BuildPlateAssetsResult } from "./buildPlateAssets";

export type ManufacturingEmailPayload = {
  to: string;
  subject: string;
  text: string;
  attachments: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
};

export function buildManufacturingEmailPayload(
  assets: BuildPlateAssetsResult,
  customer: {
    name?: string;
    email?: string;
    phone?: string;
  },
): ManufacturingEmailPayload {
  return {
    to: process.env.MANUFACTURING_EMAIL || "manufacture@carascan.com.au",
    subject: `New Carascan plate order – ${assets.identifier}`,
    text: [
      `New Carascan manufacturing job created.`,
      ``,
      `Identifier: ${assets.identifier}`,
      `Slug: ${assets.slug}`,
      `Plate URL: ${assets.plateUrl}`,
      `Mounting holes: ${assets.metadata.mountingHoles ? "Yes" : "No"}`,
      ``,
      `Customer details`,
      `Name: ${customer.name ?? "Unknown"}`,
      `Email: ${customer.email ?? "Unknown"}`,
      `Phone: ${customer.phone ?? "Unknown"}`,
      ``,
      `Generated: ${String(assets.metadata.generatedAt ?? "")}`,
    ].join("\n"),
    attachments: [
      {
        filename: `${assets.identifier}-plate.svg`,
        content: assets.plateSvg,
        contentType: "image/svg+xml",
      },
      {
        filename: `${assets.identifier}-qr.png`,
        content: assets.qrPngBuffer,
        contentType: "image/png",
      },
      {
        filename: `${assets.identifier}-metadata.json`,
        content: JSON.stringify(assets.metadata, null, 2),
        contentType: "application/json",
      },
    ],
  };
}