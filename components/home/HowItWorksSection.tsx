import SectionHeader from "@/components/home/SectionHeader";

export default function HowItWorksSection() {
  return (
    <section
      id="details"
      style={{
        padding: "36px 20px 72px",
        background: "#E7E2D8",
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
          description="One thing we all do well is observe, we love watching people backing caravans in, we love having a chat, we're all pretty good have having a drink and meeting new people. This product is designed to bridge the gap of when we meet people, we dont exchange details. But if the need arises, we can contact a person or in the worst situations, let their family know immediately."
        />

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          <article
            style={{
              background: "#FFFDF9",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
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
                color: "#5F5A54",
              }}
            >
              A person scanning the QR code has no access to any personal details. No phone numbers, no emails, no addresses. The owner can also select if they want to recieve messages via the "Virtual Doorknock"
              If the scanner doesnt want to give location access, that OK. This system is designed to be a comfort if you choose to use it, on both sides. 
            </p>
          </article>

          <article
            style={{
              background: "#FFFDF9",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
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
                color: "#5F5A54",
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