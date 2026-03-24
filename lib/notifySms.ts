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
  const cleaned = value.replace(/[^\d+]/g, "").trim();

  if (!cleaned) return "";

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  if (cleaned.startsWith("04") && cleaned.length === 10) {
    return `+61${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("61") && cleaned.length >= 11) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export async function sendSms(to: string, body: string) {
  const provider = ENV.SMS_PROVIDER;

  if (provider !== "twilio") {
    throw new Error("Only twilio is wired in MVP (set SMS_PROVIDER=twilio)");
  }

  const sid = requireSmsEnv("TWILIO_ACCOUNT_SID");
  const token = requireSmsEnv("TWILIO_AUTH_TOKEN");
  const from = normalizePhone(requireSmsEnv("TWILIO_FROM_NUMBER"));
  const normalizedTo = normalizePhone(to);

  if (!normalizedTo) {
    throw new Error("SMS recipient number is empty after normalization.");
  }

  const client = Twilio(sid, token);

  await client.messages.create({
    to: normalizedTo,
    from,
    body: String(body ?? "").trim(),
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

  if (!uniqueRecipients.length) {
    throw new Error("No SMS recipients found.");
  }

  await Promise.all(uniqueRecipients.map((to) => sendSms(to, body)));
}