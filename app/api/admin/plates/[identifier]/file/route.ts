import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

function isAuthorised(req: Request) {
  const envSecret = process.env.ADMIN_ACTION_SECRET;
  if (!envSecret) return false;

  const url = new URL(req.url);
  const headerSecret = req.headers.get("x-admin-secret");
  const querySecret = url.searchParams.get("token");

  return headerSecret === envSecret || querySecret === envSecret;
}

function getFileSpec(kind: string, identifier: string) {
  if (kind === "svg") {
    return {
      path: `plates/${identifier}/plate.svg`,
      contentType: "image/svg+xml",
      filename: `${identifier}.svg`,
    };
  }

  if (kind === "qr") {
    return {
      path: `plates/${identifier}/qr.png`,
      contentType: "image/png",
      filename: `${identifier}-qr.png`,
    };
  }

  return {
    path: `plates/${identifier}/metadata.json`,
    contentType: "application/json",
    filename: `${identifier}-metadata.json`,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  if (!isAuthorised(req)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { identifier } = await params;
  const url = new URL(req.url);
  const kind = (url.searchParams.get("kind") ?? "svg").toLowerCase();
  const shouldDownload = url.searchParams.get("download") === "1";

  const spec = getFileSpec(kind, identifier);
  const supabase = supabaseAdmin();

  const buckets = Array.from(
    new Set(
      [
        process.env.PLATE_ASSETS_BUCKET,
        "laser-packs",
        "assets",
      ].filter(Boolean) as string[]
    )
  );

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.from(bucket).download(spec.path);

    if (error || !data) {
      continue;
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": spec.contentType,
        "Cache-Control": "no-store",
        "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="${spec.filename}"`,
      },
    });
  }

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}