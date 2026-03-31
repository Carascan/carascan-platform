export default function HeroSection() {
  return (
    <section
      style={{
        padding: "88px 20px 72px",
        background: "#E7E2D8",
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
              color: "#C96A2B",
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
              color: "#5F5A54",
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
                boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
              }}
            >
              Buy your plate
            </a>

            <a
              href="#preview"
              style={{
                textDecoration: "none",
                background: "#F3F1EC",
                color: "#1F2933",
                padding: "14px 22px",
                borderRadius: 12,
                fontWeight: 700,
                border: "1px solid #B9B1A5",
              }}
            >
              Preview the plate
            </a>
          </div>
        </div>

        <div
          style={{
            background: "#F3F1EC",
            border: "1px solid #D4CEC4",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
            display: "grid",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              background: "#FFFDF9",
              padding: 18,
              border: "1px solid #D4CEC4",
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
            <span style={{ color: "#5F5A54", lineHeight: 1.5 }}>
              Messages are relayed without exposing the owner’s phone or email.
            </span>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#FFFDF9",
              padding: 18,
              border: "1px solid #D4CEC4",
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
            <span style={{ color: "#5F5A54", lineHeight: 1.5 }}>
              Notify the owner and emergency contacts when urgent help is needed.
            </span>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#FFFDF9",
              padding: 18,
              border: "1px solid #D4CEC4",
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
            <span style={{ color: "#5F5A54", lineHeight: 1.5 }}>
              A scanned plate can help someone report where your caravan was seen.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}