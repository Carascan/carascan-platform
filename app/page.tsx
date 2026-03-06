export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <section
          style={{
            textAlign: "center",
            marginBottom: 50,
          }}
        >
          <h1
            style={{
              fontSize: 44,
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Smart QR plates for caravans
          </h1>

          <p
            style={{
              fontSize: 18,
              color: "#4b5563",
              maxWidth: 720,
              margin: "0 auto 28px",
              lineHeight: 1.6,
            }}
          >
            It’s not uncommon to meet people out on the road but not know any real
            details about each other. We are all part of a big community, so if there
            is an emergency or concern the Carascan plate means you, or other
            Carascan users, can simply scan the QR code and notify emergency
            contacts if needed. It’s a shortcut to giving our family and friends
            vital information back home — including an exact location and a first
            local contact when it matters most.
          </p>

          <a
            href="/buy"
            style={{
              display: "inline-block",
              textDecoration: "none",
              borderRadius: 12,
              padding: "16px 28px",
              fontSize: 18,
              fontWeight: 600,
              background: "#111827",
              color: "#ffffff",
            }}
          >
            Buy a Carascan Plate
          </a>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <FlowCard
            icon="🚐"
            title="Caravan"
            text="Your caravan has a Carascan QR plate attached."
          />

          <FlowCard
            icon="📱"
            title="QR Scan"
            text="Someone scans the plate with their phone."
          />

          <FlowCard
            icon="📩"
            title="Secure Message"
            text="A secure message is sent without revealing your private details."
          />

          <FlowCard
            icon="🚨"
            title="Emergency Alert"
            text="Emergency contacts are notified instantly if needed."
          />
        </section>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>How it works</h2>

          <ol
            style={{
              lineHeight: 1.8,
              fontSize: 16,
              color: "#374151",
            }}
          >
            <li>Buy your laser-engraved Carascan plate</li>
            <li>Set up your secure contact page</li>
            <li>Emergency contacts receive alerts if someone scans your plate</li>
          </ol>

          <p
            style={{
              marginTop: 16,
              color: "#6b7280",
              fontSize: 14,
            }}
          >
            No personal details are publicly visible. Messages are relayed
            securely through the Carascan system.
          </p>
        </div>
      </div>
    </main>
  );
}

function FlowCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 22,
        textAlign: "center",
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>

      <h3
        style={{
          margin: "6px 0 8px",
          fontSize: 18,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: "#4b5563",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}