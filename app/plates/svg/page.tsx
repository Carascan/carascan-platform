import Link from "next/link";

export default function PlateSvgIndexPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f8",
        padding: "32px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: 28 }}>Plate SVG Preview</h1>
          <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
            This route requires a plate identifier.
          </p>
          <p style={{ color: "#111827", fontWeight: 600 }}>
            Use:
          </p>
          <pre
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 14,
              overflowX: "auto",
            }}
          >
{`/plates/CSN-000024/svg
/plates/CSN-000025/svg`}
          </pre>

          <div style={{ marginTop: 18 }}>
            <Link
              href="/admin/orders"
              style={{
                textDecoration: "none",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              Back to Admin
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}