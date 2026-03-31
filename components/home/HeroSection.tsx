export default function HeroSection() {
  return (
    <section
      style={{
        padding: "88px 20px 72px",
        background: "#F6F7F5",
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
              color: "#4F6F64",
            }}
          >
            Smart QR plates for caravans
          </p>

          <h1
            style={{
              margin: "0 0 18px 0",
              fontSize: "clamp(42px, 7vw, 64px)",
              lineHeight: 1.02,
              color: "#1F2933",
              maxWidth: 760,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Help people contact you quickly without exposing your personal details
          </h1>

          <p
            style={{
              margin: "0 0 28px 0",
              fontSize: 20,
              lineHeight: 1.6,
              color: "#6B7280",
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
                background: "#1F2933",
                color: "#FFFFFF",
                padding: "14px 22px",
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              Buy your plate
            </a>

            <a
              href="#preview"
              style={{
                textDecoration: "none",
                background: "#FFFFFF",
                color: "#1F2933",
                padding: "14px 22px",
                borderRadius: 12,
                fontWeight: 700,
                border: "1px solid #D1D5DB",
              }}
            >
              Preview the plate
            </a>
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              background: "#FFFFFF",
              padding: 18,
              border: "1px solid #E5E7EB",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 8,
                color: "#1F2933",
                fontSize: 16,
              }}
            >
              Contact owner
            </strong>
            <span style={{ color: "#6B7280", lineHeight: 1.5 }}>
              Messages are relayed without exposing the owner’s phone or email.
            </span>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#FFFFFF",
              padding: 18,
              border: "1px solid #E5E7EB",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 8,
                color: "#1F2933",
                fontSize: 16,
              }}
            >
              Emergency alerts
            </strong>
            <span style={{ color: "#6B7280", lineHeight: 1.5 }}>
              Notify the owner and emergency contacts when urgent help is needed.
            </span>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#FFFFFF",
              padding: 18,
              border: "1px solid #E5E7EB",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 8,
                color: "#1F2933",
                fontSize: 16,
              }}
            >
              Location reporting
            </strong>
            <span style={{ color: "#6B7280", lineHeight: 1.5 }}>
              A scanned plate can help someone report where your caravan was seen.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}