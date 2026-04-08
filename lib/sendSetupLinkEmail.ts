import { sendEmail } from "@/lib/notifyEmail";
import { SetupLinkEmailPayload } from "./buildSetupLinkEmailPayload";

export async function sendSetupLinkEmail(payload: SetupLinkEmailPayload) {
  try {
    const result = await sendEmail(payload.to, payload.subject, payload.html, {
      text: payload.text,
    });

    console.log("Setup link email sent:", {
      to: payload.to,
      subject: payload.subject,
      emailId: result?.data?.id ?? null,
    });

    return {
      ok: true,
      skipped: false,
      result,
    };
  } catch (error) {
    console.error("Setup link email failed:", {
      to: payload.to,
      subject: payload.subject,
      error,
    });

    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}