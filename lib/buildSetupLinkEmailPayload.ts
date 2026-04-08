import { ENV } from "./env";
import { buildSetupUrl } from "./plate";

export type SetupLinkEmailPayload = {
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

function buildSubject(identifier?: string | null) {
  return identifier
    ? `Welcome to Carascan - Carascan Setup Required (${identifier})`
    : "Welcome to Carascan - Carascan Setup Required";
}

export function buildSetupLinkEmailPayload(input: {
  to: string;
  customerName?: string | null;
  identifier?: string | null;
  setupToken: string;
}): SetupLinkEmailPayload {
  const setupUrl = buildSetupUrl(input.setupToken);
  const helpUrl = `${ENV.APP_BASE_URL}/help`;
  const name = input.customerName?.trim() || "there";
  const safeName = escapeHtml(name);
  const safeIdentifier = escapeHtml(input.identifier?.trim() || "Pending");
  const subject = buildSubject(input.identifier);

  const text = [
    `G'day ${name},`,
    ``,
    `Welcome to community, and thanks for your order.`,
    ``,
    `We're a big travelling community, side-by-side but still at arms length. We don't need to know everything about each other, but just to know we're all looking out for each other while we do our own thing.`,
    ``,
    `Plate reference: ${input.identifier?.trim() || "Pending"}`,
    ``,
    `Complete setup:`,
    setupUrl,
    ``,
    `Your plate is not active yet.`,
    `Please complete setup to activate your Carascan page.`,
    ``,
    `If you need any help, please reach out to the Carascan team through the help page:`,
    helpUrl,
    ``,
    `If you already completed setup, you can ignore this email.`,
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
            We're a big travelling community, side-by-side but still at arms length.
            We don't need to know everything about each other, but just to know we're
            all looking out for each other while we do our own thing.
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

          <p style="margin:0 0 12px 0;">Your plate is not active yet.</p>
          <p style="margin:0 0 24px 0;">Please complete setup to activate your Carascan page.</p>

          <div style="margin:0 0 24px 0;padding:16px 18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
            <p style="margin:0 0 8px 0;font-weight:700;color:#111827;">Setup link</p>
            <p style="margin:0;word-break:break-word;">
              <a href="${setupUrl}" style="color:#2563eb;text-decoration:underline;">${setupUrl}</a>
            </p>
          </div>

          <p style="margin:0 0 14px 0;">
            If you need any help, please reach out to the Carascan team through the help page.
          </p>

          <div style="margin:0 0 24px 0;">
            <a
              href="${helpUrl}"
              style="display:inline-block;padding:14px 22px;background:#ffffff;color:#111827;text-decoration:none;border-radius:10px;font-weight:700;font-size:16px;border:1px solid #d1d5db;"
            >
              Help Page
            </a>
          </div>

          <p style="margin:0;">If you already completed setup, you can ignore this email.</p>
        </div>

        <div style="padding:20px 28px 28px 28px;border-top:1px solid #e5e7eb;background:#ffffff;text-align:center;">
          <img
            src="${LOGO_URL}"
            alt="Carascan"
            style="display:block;margin:0 auto 12px auto;max-width:180px;width:100%;height:auto;border:0;outline:none;text-decoration:none;"
          />
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6b7280;">
            Carascan · Looking out for each other while we do our own thing.
          </p>
        </div>
      </div>
    </div>
  `;

  return {
    to: input.to,
    subject,
    text,
    html,
  };
}