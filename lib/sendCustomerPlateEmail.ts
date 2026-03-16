import { Resend } from "resend";
import { CustomerPlateEmailPayload } from "./buildCustomerPlateEmailPayload";

const resendApiKey = process.env.RESEND_API_KEY;

export async function sendCustomerPlateEmail(
  payload: CustomerPlateEmailPayload,
) {
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Customer email not sent.");
    return {
      ok: false,
      skipped: true,
      reason: "Missing RESEND_API_KEY",
    };
  }

  const from = process.env.FROM_EMAIL;
  if (!from) {
    console.warn("FROM_EMAIL is not configured. Customer email not sent.");
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
  });

  return {
    ok: true,
    skipped: false,
    result,
  };
}