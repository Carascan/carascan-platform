import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await req.json();

    const messageParts = [
      body?.message ?? "",
      body?.latitude && body?.longitude
        ? `Google Maps: https://maps.google.com/?q=${body.latitude},${body.longitude}`
        : "",
      body?.latitude && body?.longitude
        ? `Coordinates: ${body.latitude}, ${body.longitude}`
        : "",
      body?.accuracy_m ? `Accuracy: ${body.accuracy_m}m` : "",
    ].filter(Boolean);

    const relayMessage = messageParts.join("\n\n");

    const r = await fetch(
      `${process.env.APP_BASE_URL || "https://carascan.com.au"}/api/plates/${encodeURIComponent(slug)}/contact`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          reporter_name: body?.reporter_name ?? "",
          reporter_phone: body?.reporter_phone ?? "",
          reporter_email: body?.reporter_email ?? "",
          message: relayMessage,
          meta: {
            type: "location_report",
            latitude: body?.latitude ?? null,
            longitude: body?.longitude ?? null,
            accuracy_m: body?.accuracy_m ?? null,
          },
        }),
      }
    );

    const json = await r.json().catch(() => null);

    if (!r.ok) {
      return NextResponse.json(
        { error: json?.error ?? "Failed to relay location report" },
        { status: r.status }
      );
    }

    return NextResponse.json({ ok: true, relayed_via: "contact" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    );
  }
}