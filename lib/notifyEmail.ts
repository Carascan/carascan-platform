import { Resend } from "resend";
import { ManufacturingEmailPayload } from "./buildManufacturingEmailPayload";
import { ENV } from "./env";

const resend = new Resend(ENV.RESEND_API_KEY);

export type EmailAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  options?: {
    text?: string;
    attachments?: EmailAttachment[];
  }
) {
  const from = ENV.FROM_EMAIL;
  const recipients = Array.isArray(to) ? to : [to];

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
    text: options?.text,
    attachments: options?.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    })),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result;
}

export async function sendManufacturingEmail(payload: ManufacturingEmailPayload) {
  const result = await sendEmail(payload.to, payload.subject, payload.html, {
    text: payload.text,
    attachments: payload.attachments,
  });

  return {
    ok: true,
    skipped: false,
    result,
  };
}