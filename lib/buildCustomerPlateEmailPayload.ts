import { buildSetupUrl } from "./plate";
import { BuildPlateAssetsResult } from "./buildPlateAssets";

export type CustomerPlateEmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export function buildCustomerPlateEmailPayload(
  assets: BuildPlateAssetsResult,
  input: {
    customerEmail: string;
    customerName?: string;
    setupToken: string;
  },
): CustomerPlateEmailPayload {
  const setupUrl = buildSetupUrl(input.setupToken);

  return {
    to: input.customerEmail,
    subject: `Your Carascan plate order – ${assets.identifier}`,
    text: [
      `Hi ${input.customerName ?? "there"},`,
      ``,
      `Thanks for your Carascan order.`,
      `Your plate reference is ${assets.identifier}.`,
      ``,
      `Your setup link:`,
      setupUrl,
      ``,
      `Your plate is not active yet.`,
      `Please complete setup to activate your Carascan page.`,
      ``,
      `Plate URL after activation:`,
      assets.plateUrl,
    ].join("\n"),
  };
}