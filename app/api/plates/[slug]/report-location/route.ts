import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await req.json();

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
          message: body?.message ?? "",
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

    return NextResponse.json({
      ok: true,
      relayed_via: "contact",
    });
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