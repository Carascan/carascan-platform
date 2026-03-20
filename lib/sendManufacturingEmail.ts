import { sendEmail } from "@/lib/notifyEmail";

type Input = {
  to: string | string[];
  identifier: string;
  svgUrl?: string | null;
  qrUrl?: string | null;
};

export async function sendManufacturingEmail(input: Input) {
  const { to, identifier, svgUrl, qrUrl } = input;

  const subject = `Manufacturing pack - ${identifier}`;

  const html = `
    <h2>Carascan Manufacturing Pack</h2>

    <p><strong>Plate:</strong> ${identifier}</p>

    ${
      svgUrl
        ? `<p><a href="${svgUrl}" target="_blank">Download SVG File</a></p>`
        : `<p>SVG file not available</p>`
    }

    ${
      qrUrl
        ? `<p><a href="${qrUrl}" target="_blank">View QR Code</a></p>`
        : ""
    }

    <p>This file is ready for laser production.</p>
  `;

  await sendEmail(to, subject, html);
}