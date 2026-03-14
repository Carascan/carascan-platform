import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifyEmail";

export async function GET() {
  try {
    await sendEmail(
      "YOUR_EMAIL@HERE.com",
      "Carascan Email Test",
      "<p>Email integration is working.</p>"
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}