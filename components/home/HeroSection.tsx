export default function HeroSection() {
  return (
    <section
      style={{
        padding: "88px 20px 72px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#2563eb",
            }}
          >
            Smart QR plates for caravans
          </p>

          <h1
            style={{
              margin: "0 0 18px 0",
              fontSize: "clamp(42px, 7vw, 64px)",
              lineHeight: 1.02,
              color: "#111827",
              maxWidth: 760,
            }}
          >
            Help people contact you quickly without exposing your personal details
          </h1>

          <p
            style={{
              margin: "0 0 28px 0",
              fontSize: 20,
              lineHeight: 1.6,
              color: "#4b5563",
              maxWidth: 680,
            }}
          >
            Carascan QR plates let someone report your location, contact you, or trigger an
            emergency alert through a secure relay system.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/buy"
              style={{
                textDecoration: "none",
                background: "#111827",
                color: "#fff",
                padding: "14px 22px",
                borderRadius: 999,
                fontWeight: 700,
              }}
            >
              Buy your plate
            </a>

            <a
              href="#preview"
              style={{
                textDecoration: "none",
                background: "#fff",
                color: "#111827",
                padding: "14px 22px",
                borderRadius: 999,
                fontWeight: 700,
                border: "1px solid #d1d5db",
              }}
            >
              Preview the plate
            </a>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 20,
              background: "#f9fafb",
              padding: 18,
              border: "1px solid #e5e7eb",
            }}
          >
            <strong style={{ display: "block", marginBottom: 8, color: "#111827" }}>
              Contact owner
            </strong>
            <span style={{ color: "#4b5563", lineHeight: 1.5 }}>
              Messages are relayed without exposing the owner’s phone or email.
            </span>
          </div>

          <div
            style={{
              borderRadius: 20,
              background: "#f9fafb",
              padding: 18,
              border: "1px solid #e5e7eb",
            }}
          >
            <strong style={{ display: "block", marginBottom: 8, color: "#111827" }}>
              Emergency alerts
            </strong>
            <span style={{ color: "#4b5563", lineHeight: 1.5 }}>
              Notify the owner and emergency contacts when urgent help is needed.
            </span>
          </div>

          <div
            style={{
              borderRadius: 20,
              background: "#f9fafb",
              padding: 18,
              border: "1px solid #e5e7eb",
            }}
          >
            <strong style={{ display: "block", marginBottom: 8, color: "#111827" }}>
              Location reporting
            </strong>
            <span style={{ color: "#4b5563", lineHeight: 1.5 }}>
              A scanned plate can help someone report where your caravan was seen.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}