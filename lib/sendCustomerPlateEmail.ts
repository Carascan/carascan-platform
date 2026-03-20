import { sendEmail } from "@/lib/notifyEmail";
import { CustomerPlateEmailPayload } from "./buildCustomerPlateEmailPayload";

export async function sendCustomerPlateEmail(
  payload: CustomerPlateEmailPayload
) {
  try {
    await sendEmail(payload.to, payload.subject, payload.html);

    return {
      ok: true,
      skipped: false,
    };
  } catch (error) {
    console.error("Customer email failed:", error);

    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}