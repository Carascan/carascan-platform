import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { buildManufacturingEmailPayload } from "@/lib/buildManufacturingEmailPayload";
import { sendManufacturingEmail } from "@/lib/notifyEmail";

const MANUFACTURING_EMAIL_TO =
  process.env.MANUFACTURING_EMAIL_TO ?? process.env.FROM_EMAIL ?? "";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ plateId: string }> }
) {
  try {
    const { plateId } = await params;
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
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    if (!MANUFACTURING_EMAIL_TO) {
      return NextResponse.json(
        { error: "Missing MANUFACTURING_EMAIL_TO or FROM_EMAIL" },
        { status: 500 }
      );
    }

    const manufacturingPayload = buildManufacturingEmailPayload({
      to: MANUFACTURING_EMAIL_TO,
      identifier: plate.identifier,
    });

    const emailResult = await sendManufacturingEmail(manufacturingPayload);

    return NextResponse.json({
      ok: true,
      email: emailResult,
    });
  } catch (error) {
    console.error("Laser pack route failed:", error);

    return NextResponse.json(
      { error: "Failed to process laser pack" },
      { status: 500 }
    );
  }
}