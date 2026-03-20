import { buildSetupUrl } from "./plate";
import { BuildPlateAssetsResult } from "./buildPlateAssets";

export type CustomerPlateEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildCustomerPlateEmailPayload(
  assets: BuildPlateAssetsResult,
  input: {
    customerEmail: string;
    customerName?: string;
    setupToken: string;
  }
): CustomerPlateEmailPayload {
  const setupUrl = buildSetupUrl(input.setupToken);
  const name = input.customerName?.trim() || "there";

  const text = [
    `Hi ${name},`,
    ``,
    `Thanks for your Carascan order.`,
    `Your plate reference is ${assets.identifier}.`,
    ``,
    `Setup your plate:`,
    setupUrl,
    ``,
    `Your plate is not active yet.`,
    `Complete setup to activate your Carascan page.`,
    ``,
    `Plate URL after activation:`,
    assets.plateUrl,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px 0;">Carascan Order</h2>

      <p>Hi ${escapeHtml(name)},</p>

      <p>Thanks for your Carascan order.</p>

      <p><strong>Plate reference:</strong> ${escapeHtml(assets.identifier)}</p>

      <p style="margin:20px 0;">
        <a href="${setupUrl}" style="display:inline-block;padding:12px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">
          Complete Setup
        </a>
      </p>

      <p>Your plate is not active yet.</p>
      <p>Please complete setup to activate your Carascan page.</p>

      <hr style="margin:24px 0;" />

      <p><strong>Plate URL after activation:</strong></p>
      <p>
        <a href="${assets.plateUrl}" style="color:#2563eb;">
          ${assets.plateUrl}
        </a>
      </p>
    </div>
  `;

  return {
    to: input.customerEmail,
    subject: `Your Carascan plate order – ${assets.identifier}`,
    text,
    html,
  };
}