import QRCode from "qrcode";
import { CARASCAN } from "./config";

export type QrMode = "preview" | "production";

export type GenerateQrOptions = {
  mode?: QrMode;
  width?: number;
  margin?: number;
  transparentBackground?: boolean;
};

function getDefaults(mode: QrMode) {
  if (mode === "production") {
    return {
      errorCorrectionLevel: CARASCAN.qr.productionErrorCorrectionLevel,
      margin: CARASCAN.qr.productionMargin,
      width: CARASCAN.qr.pngSizePx,
    };
  }

  return {
    errorCorrectionLevel: CARASCAN.qr.previewErrorCorrectionLevel,
    margin: CARASCAN.qr.previewMargin,
    width: CARASCAN.qr.pngSizePx,
  };
}

export async function generateQrDataUrl(
  value: string,
  options: GenerateQrOptions = {},
): Promise<string> {
  const mode = options.mode ?? "preview";
  const defaults = getDefaults(mode);

  return QRCode.toDataURL(value, {
    errorCorrectionLevel: defaults.errorCorrectionLevel,
    margin: options.margin ?? defaults.margin,
    width: options.width ?? defaults.width,
    color: {
      dark: "#000000",
      light: options.transparentBackground === false ? "#ffffff" : "#0000",
    },
  });
}

export async function generateQrBuffer(
  value: string,
  options: GenerateQrOptions = {},
): Promise<Buffer> {
  const mode = options.mode ?? "production";
  const defaults = getDefaults(mode);

  return QRCode.toBuffer(value, {
    type: "png",
    errorCorrectionLevel: defaults.errorCorrectionLevel,
    margin: options.margin ?? defaults.margin,
    width: options.width ?? defaults.width,
    color: {
      dark: "#000000",
      light: options.transparentBackground === false ? "#ffffff" : "#0000",
    },
  });
}