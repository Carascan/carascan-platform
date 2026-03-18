import QRCode from "qrcode";
import { getPlatePublicUrl } from "@/lib/plateUrl";

export async function generateQrPng(slug: string) {
  const url = getPlatePublicUrl(slug);

  return QRCode.toBuffer(url, {
    type: "png",
    width: 1200,
    margin: 1,
  });
}