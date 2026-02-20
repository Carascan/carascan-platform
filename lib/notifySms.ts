import Twilio from "twilio";

export async function sendSms(to: string, body: string) {
  const provider = (process.env.SMS_PROVIDER || "twilio").toLowerCase();
  if (provider !== "twilio") throw new Error("Only twilio is wired in MVP (set SMS_PROVIDER=twilio)");
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;
  if (!sid || !token || !from) throw new Error("Missing TWILIO_* env vars");
  const client = Twilio(sid, token);
  await client.messages.create({ to, from, body });
}
