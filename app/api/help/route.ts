import { NextResponse } from "next/server";
import { sendManufacturingEmail } from "@/lib/notifyEmail";

export async function POST(req: Request) {
  try {
    const { topic, contact, message } = await req.json();

    if (!topic || !contact || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const email = {
      to: process.env.MANUFACTURING_EMAIL!,
      subject: "Carascan Help Request",
      html: `
        <h2>Help Request</h2>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await sendManufacturingEmail(email as any);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Help request failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}