import { NextRequest, NextResponse } from "next/server";
import { buildPlateAssets } from "@/lib/buildPlateAssets";
import { buildManufacturingEmailPayload } from "@/lib/buildManufacturingEmailPayload";
import { sendManufacturingEmail } from "@/lib/sendManufacturingEmail";

// Replace with real DB lookup
async function getMockPlate(plateId: string) {
  return {
    id: plateId,
    identifier: "CSN-000234",
    slug: "abc123xyz",
    mountingHoles: true,
    logoSvgMarkup: "",
    customer: {
      name: "Test Customer",
      email: "customer@example.com",
      phone: "",
    },
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ plateId: string }> },
) {
  try {
    const { plateId } = await context.params;
    const plate = await getMockPlate(plateId);

    if (!plate) {
      return NextResponse.json({ error: "Plate not found" }, { status: 404 });
    }

    const assets = await buildPlateAssets({
      identifier: plate.identifier,
      slug: plate.slug,
      mountingHoles: plate.mountingHoles,
      logoSvgMarkup: plate.logoSvgMarkup,
    });

    const emailPayload = buildManufacturingEmailPayload(assets, {
      name: plate.customer?.name,
      email: plate.customer?.email,
      phone: plate.customer?.phone,
    });

   const emailResult = await sendManufacturingEmail({
  to: emailPayload.to,
  identifier: plate.identifier, // 👈 FIX
  svgUrl: emailPayload.svgUrl,
  qrUrl: emailPayload.qrUrl,
});

    return NextResponse.json({
      ok: true,
      identifier: assets.identifier,
      slug: assets.slug,
      plateUrl: assets.plateUrl,
      metadata: assets.metadata,
      email: emailResult,
    });
  } catch (error) {
    console.error("Failed to generate laser pack", error);
    return NextResponse.json(
      { error: "Failed to generate laser pack" },
      { status: 500 },
    );
  }
}