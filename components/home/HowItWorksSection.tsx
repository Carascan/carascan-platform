import SectionHeader from "@/components/home/SectionHeader";

export default function HowItWorksSection() {
  return (
    <section
      id="details"
      style={{
        padding: "88px 20px",
        background: "#F6F7F5",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <SectionHeader
          eyebrow="More detail"
          title="Designed for owners, travellers, and safer communities"
          description="This section is separate from the flow cards so longer-form messaging can be edited independently for future homepage expansion."
        />

        <div
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          <article
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: 22,
                color: "#1F2933",
                fontWeight: 600,
              }}
            >
              Private by design
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.7,
                color: "#6B7280",
              }}
            >
              The public scanner does not need direct access to the owner’s personal mobile
              number or email address. Carascan acts as the relay layer.
            </p>
          </article>

          <article
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                margin: "0 0 12px 0",
                fontSize: 22,
                color: "#1F2933",
                fontWeight: 600,
              }}
            >
              Built for expansion
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.7,
                color: "#6B7280",
              }}
            >
              The same platform can later support caravans, trailers, plant, boats, and other
              assets using the same shared backend structure.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}