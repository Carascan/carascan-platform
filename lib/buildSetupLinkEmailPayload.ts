import { buildSetupUrl } from "./plate";

export type SetupLinkEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string; // ✅ added
};

export function buildSetupLinkEmailPayload(input: {
  to: string;
  customerName?: string | null;
  identifier?: string | null;
  setupToken: string;
}): SetupLinkEmailPayload {
  const setupUrl = buildSetupUrl(input.setupToken);

  const name = input.customerName?.trim() || "there";

  const subject = input.identifier
    ? `Your Carascan setup link – ${input.identifier}`
    : "Your Carascan setup link";

  const text = [
    `Hi ${name},`,
    ``,
    `Here is your Carascan setup link.`,
    `Use this link to complete or continue setup for your plate.`,
    ``,
    setupUrl,
    ``,
    `If you already completed setup, you can ignore this email.`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827">
      <h2>Carascan Setup</h2>

      <p>Hi ${name},</p>

      <p>Here is your Carascan setup link.</p>
      <p>Use this link to complete or continue setup for your plate.</p>

      <p>
        <a href="${setupUrl}" style="display:inline-block;padding:12px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600">
          Open Setup
        </a>
      </p>

      <p>If you already completed setup, you can ignore this email.</p>
    </div>
  `;

  return {
    to: input.to,
    subject,
    text,
    html, // ✅ critical
  };
}