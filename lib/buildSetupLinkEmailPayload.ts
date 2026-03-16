import { buildSetupUrl } from "./plate";

export type SetupLinkEmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export function buildSetupLinkEmailPayload(input: {
  to: string;
  customerName?: string | null;
  identifier?: string | null;
  setupToken: string;
}) : SetupLinkEmailPayload {
  const setupUrl = buildSetupUrl(input.setupToken);

  return {
    to: input.to,
    subject: input.identifier
      ? `Your Carascan setup link – ${input.identifier}`
      : "Your Carascan setup link",
    text: [
      `Hi ${input.customerName?.trim() || "there"},`,
      ``,
      `Here is your Carascan setup link.`,
      `Use this link to complete or continue setup for your plate.`,
      ``,
      setupUrl,
      ``,
      `If you already completed setup, you can ignore this email.`,
    ].join("\n"),
  };
}
