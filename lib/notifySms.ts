import Twilio from "twilio";
import { ENV } from "@/lib/env";

function requireSmsEnv(
  name: "TWILIO_ACCOUNT_SID" | "TWILIO_AUTH_TOKEN" | "TWILIO_FROM_NUMBER"
): string {
  const value = ENV[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

export async function sendSms(to: string, body: string) {
  const provider = ENV.SMS_PROVIDER;

  if (provider !== "twilio") {
    throw new Error("Only twilio is wired in MVP (set SMS_PROVIDER=twilio)");
  }

  const sid = requireSmsEnv("TWILIO_ACCOUNT_SID");
  const token = requireSmsEnv("TWILIO_AUTH_TOKEN");
  const from = normalizePhone(requireSmsEnv("TWILIO_FROM_NUMBER"));

  const client = Twilio(sid, token);

  await client.messages.create({
    to: normalizePhone(to),
    from,
    body,
  });
}

export async function sendSmsMany(recipients: string[], body: string) {
  const uniqueRecipients = Array.from(
    new Set(
      recipients
        .map((value) => normalizePhone(String(value ?? "").trim()))
        .filter(Boolean)
    )
  );

  if (!uniqueRecipients.length) return;

  await Promise.all(uniqueRecipients.map((to) => sendSms(to, body)));
}