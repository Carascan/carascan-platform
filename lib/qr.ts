import QRCode from "qrcode";

export async function makeQrPngDataUrl(url: string) {
  return QRCode.toDataURL(url, { errorCorrectionLevel: "H", margin: 2, scale: 8 });
}

export async function makeQrPngBuffer(url: string) {
  return QRCode.toBuffer(url, { errorCorrectionLevel: "H", margin: 2, scale: 8, type: "png" });
}
