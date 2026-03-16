import { BuildPlateAssetsResult } from "./buildPlateAssets";

export type SavedPlateAssets = {
  qrPath: string;
  svgPath: string;
  metadataPath: string;
};

export async function savePlateAssets(
  assets: BuildPlateAssetsResult,
): Promise<SavedPlateAssets> {
  // TODO: Replace with real Supabase Storage upload logic
  return {
    qrPath: `plates/${assets.identifier}/qr.png`,
    svgPath: `plates/${assets.identifier}/plate.svg`,
    metadataPath: `plates/${assets.identifier}/metadata.json`,
  };
}