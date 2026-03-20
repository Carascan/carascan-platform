import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
) {
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Carascan <alerts@updates.carascan.com.au>";

  const result = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result;
}