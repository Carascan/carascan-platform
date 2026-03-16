import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildSetupLinkEmailPayload } from "@/lib/buildSetupLinkEmailPayload";
import { sendSetupLinkEmail } from "@/lib/sendSetupLinkEmail";

function randToken(len = 48) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

function isAuthorised(req: Request, bodySecret?: string) {
  const envSecret = process.env.ADMIN_ACTION_SECRET;
  if (!envSecret) {
    return false;
  }

  const headerSecret = req.headers.get("x-admin-secret");
  return headerSecret === envSecret || bodySecret === envSecret;
}

export async function POST(req: Request) {
  let body: { plateId?: string; email?: string; adminSecret?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isAuthorised(req, body.adminSecret)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const plateId = typeof body.plateId === "string" ? body.plateId.trim() : "";
  const overrideEmail =
    typeof body.email === "string" ? body.email.trim() : "";

  if (!plateId) {
    return NextResponse.json({ error: "Missing plateId" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data: plate, error: plateError } = await sb
    .from("plates")
    .select("id, identifier, status")
    .eq("id", plateId)
    .maybeSingle();

  if (plateError) {
    return NextResponse.json(
      { error: `Plate lookup failed: ${plateError.message}` },
      { status: 500 },
    );
  }

  if (!plate) {
    return NextResponse.json({ error: "Plate not found" }, { status: 404 });
  }

  const { data: order, error: orderError } = await sb
    .from("orders")
    .select("shipping_name")
    .eq("plate_id", plateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json(
      { error: `Order lookup failed: ${orderError.message}` },
      { status: 500 },
    );
  }

  const { data: latestToken, error: latestTokenError } = await sb
    .from("plate_setup_tokens")
    .select("email")
    .eq("plate_id", plateId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestTokenError) {
    return NextResponse.json(
      { error: `Token lookup failed: ${latestTokenError.message}` },
      { status: 500 },
    );
  }

  const targetEmail = overrideEmail || latestToken?.email || "";

  if (!targetEmail) {
    return NextResponse.json(
      { error: "No email available for this plate" },
      { status: 400 },
    );
  }

  const revokeOldTokens = await sb
    .from("plate_setup_tokens")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("plate_id", plateId)
    .is("used_at", null)
    .is("revoked_at", null);

  if (revokeOldTokens.error) {
    return NextResponse.json(
      { error: `Old token revoke failed: ${revokeOldTokens.error.message}` },
      { status: 500 },
    );
  }

  const token = randToken(48);
  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 14,
  ).toISOString();

  const { error: insertTokenError } = await sb
    .from("plate_setup_tokens")
    .insert({
      token,
      plate_id: plateId,
      email: targetEmail,
      expires_at: expiresAt,
    });

  if (insertTokenError) {
    return NextResponse.json(
      { error: `Token insert failed: ${insertTokenError.message}` },
      { status: 500 },
    );
  }

  const emailPayload = buildSetupLinkEmailPayload({
    to: targetEmail,
    customerName: order?.shipping_name ?? null,
    identifier: plate.identifier ?? null,
    setupToken: token,
  });

  const emailResult = await sendSetupLinkEmail(emailPayload);

  if (plate.status !== "active") {
    const { error: plateStatusError } = await sb
      .from("plates")
      .update({ status: "setup_pending" })
      .eq("id", plateId);

    if (plateStatusError) {
      return NextResponse.json(
        { error: `Plate status update failed: ${plateStatusError.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    plateId,
    identifier: plate.identifier ?? null,
    email: targetEmail,
    emailResult,
  });
}