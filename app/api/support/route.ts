import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/notifyEmail";

export async function POST(req: Request) {
  const body = await req.json();

  await sendEmail(
    ["manufacture@carascan.com.au"],
    "Carascan Support Request",
    `
      <p><strong>Type:</strong> ${body.type}</p>
      <p><strong>Email:</strong> ${body.email}</p>
      <p>${body.message}</p>
    `
  );

  return NextResponse.json({ ok: true });
}