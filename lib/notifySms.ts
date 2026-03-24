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

function normalizePhone(value: string): string {
  const cleaned = String(value ?? "").replace(/[^\d+]/g, "").trim();

  if (!cleaned) return "";

  let normalized = "";

  if (cleaned.startsWith("+")) {
    normalized = cleaned;
  } else if (cleaned.startsWith("04") && cleaned.length === 10) {
    normalized = `+61${cleaned.slice(1)}`;
  } else if (cleaned.startsWith("61") && cleaned.length >= 11) {
    normalized = `+${cleaned}`;
  } else if (cleaned.startsWith("4") && cleaned.length === 9) {
    normalized = `+61${cleaned}`;
  } else {
    return "";
  }

  return /^\+\d{8,15}$/.test(normalized) ? normalized : "";
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
  const trimmedBody = String(body ?? "").trim();

  if (!from) {
    throw new Error("TWILIO_FROM_NUMBER is invalid after normalization.");
  }

  if (!normalizedTo) {
    throw new Error("SMS recipient number is empty or invalid after normalization.");
  }

  if (!trimmedBody) {
    throw new Error("SMS body is empty.");
  }

  console.log("[SMS DEBUG] sendSms start", {
    provider,
    to: normalizedTo,
    from,
    hasSid: !!sid,
    hasToken: !!token,
  });

  const client = Twilio(sid, token);

  try {
    const result = await client.messages.create({
      to: normalizedTo,
      from,
      body: trimmedBody,
    });

    console.log("[SMS DEBUG] Twilio message created", {
      sid: result.sid,
      status: result.status,
      to: normalizedTo,
      from,
    });

    return result;
  } catch (error) {
    console.error("[SMS DEBUG] Twilio send failed", {
      to: normalizedTo,
      from,
      error,
    });
    throw error;
  }
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

  console.log("[SMS DEBUG] sendSmsMany recipients", {
    rawCount: recipients.length,
    uniqueCount: uniqueRecipients.length,
    recipients: uniqueRecipients,
  });

  const results = [];

  for (const to of uniqueRecipients) {
    const result = await sendSms(to, body);
    results.push(result);
  }

  return results;
}