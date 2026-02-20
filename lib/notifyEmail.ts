import { Resend } from "resend";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY!;
  const from = process.env.FROM_EMAIL!;
  if (!apiKey || !from) throw new Error("Missing RESEND_API_KEY or FROM_EMAIL");
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to, subject, html });
}
