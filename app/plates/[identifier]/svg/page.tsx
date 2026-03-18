import Link from "next/link";

const BUCKET_BASE =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets";

function isAuthorised(token?: string) {
  const envSecret = process.env.ADMIN_ACTION_SECRET;
  if (!envSecret) return false;
  return token === envSecret;
}

export default async function PlateSvgPage({
  params,
  searchParams,
}: {
  params: Promise<{ identifier: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { identifier } = await params;
  const { token } = await searchParams;

  if (!isAuthorised(token)) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f8",
          padding: "32px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <h1 style={{ marginTop: 0, fontSize: 28 }}>Unauthorised</h1>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
              This SVG preview page requires a valid admin token.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const svgUrl = `${BUCKET_BASE}/plates/${encodeURIComponent(identifier)}/plate.svg`;
  const qrUrl = `${BUCKET_BASE}/plates/${encodeURIComponent(identifier)}/qr.png`;
  const metadataUrl = `${BUCKET_BASE}/plates/${encodeURIComponent(identifier)}/metadata.json`;
  const adminOrdersUrl = `/admin/orders?token=${encodeURIComponent(token ?? "")}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f8",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              SVG Preview — {identifier}
            </h1>
            <p style={{ margin: "8px 0 0", color: "#4b5563" }}>
              Review the generated manufacturing SVG and download files.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={adminOrdersUrl}
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                fontWeight: 600,
              }}
            >
              Back to Admin
            </Link>

            <a
              href={svgUrl}
              download={`${identifier}.svg`}
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 10,
                border: 0,
                background: "#111827",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              Download SVG
            </a>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 1fr) 320px",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "#e9e9ea",
              borderRadius: 24,
              padding: 20,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 20,
              }}
            >
              <img
                src={svgUrl}
                alt={`Plate SVG ${identifier}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                }}
              />
            </div>
          </div>

          <aside
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: 20 }}>Files</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <a
                href={svgUrl}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Open SVG
              </a>

              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Open QR PNG
              </a>

              <a
                href={metadataUrl}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
              >
                Open metadata.json
              </a>
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid #e5e7eb",
                color: "#4b5563",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <div>
                <strong>Storage path:</strong>
              </div>
              <div style={{ wordBreak: "break-all" }}>
                assets/plates/{identifier}/plate.svg
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#f9fafb",
  color: "#111827",
  fontWeight: 600,
};