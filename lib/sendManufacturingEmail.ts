import { Resend } from "resend";
import { ManufacturingEmailPayload } from "./buildManufacturingEmailPayload";

const resendApiKey = process.env.RESEND_API_KEY;

export async function sendManufacturingEmail(
  payload: ManufacturingEmailPayload,
) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Manufacturing email not sent.");
    return {
      ok: false,
      skipped: true,
      reason: "Missing RESEND_API_KEY",
    };
  }

  const from = process.env.FROM_EMAIL;
  if (!from) {
    console.warn("FROM_EMAIL is not configured. Manufacturing email not sent.");
    return {
      ok: false,
      skipped: true,
      reason: "Missing FROM_EMAIL",
    };
  }

  const resend = new Resend(resendApiKey);

  const result = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    attachments: payload.attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });

  return {
    ok: true,
    skipped: false,
    result,
  };
}