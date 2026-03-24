import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requireAdminActionSecret, ENV } from "@/lib/env";
import { sendEmail } from "@/lib/notifyEmail";

function unauthorised() {
  return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export async function POST(req: Request) {
  try {
    const provided = req.headers.get("x-admin-secret")?.trim() ?? "";
    const expected = requireAdminActionSecret();

    if (!provided || provided !== expected) {
      return unauthorised();
    }

    const body = await req.json().catch(() => null);
    const plateId = String(body?.plateId ?? "").trim();

    if (!plateId) {
      return NextResponse.json({ error: "Missing plateId" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    const { data: plate, error: plateError } = await sb
      .from("plates")
      .select("id, identifier, slug")
      .eq("id", plateId)
      .maybeSingle();

    if (plateError) {
      return NextResponse.json(
        { error: `Plate lookup failed: ${plateError.message}` },
        { status: 500 }
      );
    }

    if (!plate) {
      return NextResponse.json({ error: "Plate not found." }, { status: 404 });
    }

    const { data: latestTokenRow, error: latestTokenError } = await sb
      .from("plate_setup_tokens")
      .select("email")
      .eq("plate_id", plate.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestTokenError) {
      return NextResponse.json(
        { error: `Setup recipient lookup failed: ${latestTokenError.message}` },
        { status: 500 }
      );
    }

    const recipientEmail = String(latestTokenRow?.email ?? "").trim();

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "No recipient email found for this plate." },
        { status: 404 }
      );
    }

    const { error: revokeError } = await sb
      .from("plate_setup_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("plate_id", plate.id)
      .is("used_at", null)
      .is("revoked_at", null);

    if (revokeError) {
      return NextResponse.json(
        { error: `Failed to revoke old setup links: ${revokeError.message}` },
        { status: 500 }
      );
    }

    const token = randomUUID().replace(/-/g, "");
    const expiresAt = addDays(new Date(), 7).toISOString();

    const { error: insertError } = await sb.from("plate_setup_tokens").insert({
      plate_id: plate.id,
      token,
      email: recipientEmail,
      expires_at: expiresAt,
    });

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to create setup link: ${insertError.message}` },
        { status: 500 }
      );
    }

    const setupUrl = `${ENV.APP_BASE_URL}/setup/${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
        <h2 style="margin:0 0 16px 0;">Your Carascan setup link</h2>
        <p style="margin:0 0 8px 0;"><strong>Plate:</strong> ${plate.identifier}</p>
        <p style="margin:0 0 16px 0;">
          Your setup link has been reissued. Use the button below to continue setup.
        </p>
        <p style="margin:0 0 16px 0;">
          <a
            href="${setupUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="display:inline-block;padding:12px 16px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;"
          >
            Open setup page
          </a>
        </p>
        <p style="margin:0 0 8px 0;color:#6b7280;font-size:13px;word-break:break-all;">
          Direct link:<br />
          <a href="${setupUrl}" target="_blank" rel="noopener noreferrer">${setupUrl}</a>
        </p>
        <p style="margin:16px 0 0 0;color:#6b7280;font-size:13px;">
          This link expires in 7 days.
        </p>
      </div>
    `;

    await sendEmail(
      [recipientEmail],
      `Carascan setup link - ${plate.identifier}`,
      html
    );

    return NextResponse.json({
      ok: true,
      identifier: plate.identifier,
      email: recipientEmail,
      setupUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to resend setup link.",
      },
      { status: 500 }
    );
  }
}