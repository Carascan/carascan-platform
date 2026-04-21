import { ENV } from "./env";
import { buildSetupUrl } from "./plate";
import { BuildPlateAssetsResult } from "./buildPlateAssets";

export type CustomerPlateEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

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
  const helpUrl = `${ENV.APP_BASE_URL}/help`;
  const name = input.customerName?.trim() || "there";
  const safeName = escapeHtml(name);
  const safeIdentifier = escapeHtml(assets.identifier);

  const subject = `Welcome to Carascan - Carascan Setup Required (${assets.identifier})`;

  const text = [
    `G'day ${name},`,
    ``,
    `Welcome to community, and thanks for your order.`,
    ``,
    `We're a big travelling community in Australia, side-by-side but still at arms length. We don't need to know everything about each other, but just to know we're all looking out for each other while we explore and relax in our own unique way.`,
    ``,
    `Plate reference: ${assets.identifier}`,
    ``,
    `Complete setup:`,
    setupUrl,
    ``,
    `Your plate is not active yet. Click the link above and you will be directed to set up your Carascan profile. You can enter a caravan name and bio if you choose, and also provide phone numbers for SMS contact to you and a partner, along with your emergency contacts.`,
    ``,
    `Plate URL after activation:`,
    assets.plateUrl,
    ``,
    `If you need any help, please reach out to the Carascan team through the help page or email us at manufacture@carascan.com.au.`,
    helpUrl,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:24px 12px;background:#f3f4f6;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:28px 28px 16px 28px;border-bottom:1px solid #e5e7eb;background:#ffffff;text-align:center;">
          <img
            src="${LOGO_URL}"
            alt="Carascan"
            style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;border:0;outline:none;text-decoration:none;"
          />
        </div>

        <div style="padding:32px 28px 20px 28px;font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#1f2937;font-size:16px;">
          <p style="margin:0 0 18px 0;">G'day ${safeName},</p>

          <p style="margin:0 0 18px 0;">Welcome to community, and thanks for your order.</p>

          <p style="margin:0 0 22px 0;">
            We're a big travelling community in Australia, side-by-side but still at arms length.
            We don't need to know everything about each other, but just to know we're all looking
            out for each other while we explore and relax in our own unique way.
          </p>

          <p style="margin:0 0 20px 0;">
            <strong>Plate reference:</strong> ${safeIdentifier}
          </p>

          <div style="margin:0 0 24px 0;">
            <a
              href="${setupUrl}"
              style="display:inline-block;padding:14px 22px;background:#111827;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;"
            >
              Complete Setup
            </a>
          </div>

          <p style="margin:0 0 24px 0;">
            Your plate is not active yet. Click the link above and you will be directed to set up your
            Carascan profile. You can enter a caravan name and bio if you choose, and also provide phone
            numbers for SMS contact to you and a partner, along with your emergency contacts.
          </p>

          <div style="margin:0 0 24px 0;padding:16px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
            <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">Plate URL after activation</p>
            <p style="margin:0;word-break:break-word;">
              <a href="${assets.plateUrl}" style="color:#2563eb;text-decoration:underline;">
                ${assets.plateUrl}
              </a>
            </p>
          </div>

          <p style="margin:0 0 18px 0;text-align:center;">
            If you need any help, please reach out to the Carascan team through the help page or email us at
            <a href="mailto:manufacture@carascan.com.au" style="color:#2563eb;text-decoration:underline;"> manufacture@carascan.com.au</a>.
          </p>

          <div style="margin:0 0 8px 0;text-align:center;">
            <a
              href="${helpUrl}"
              style="display:inline-block;padding:14px 22px;background:#ffffff;color:#111827;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;border:1px solid #d1d5db;"
            >
              Help Page
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    to: input.customerEmail,
    subject,
    text,
    html,
  };
}