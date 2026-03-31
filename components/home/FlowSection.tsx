import FlowCard from "@/components/home/FlowCard";
import SectionHeader from "@/components/home/SectionHeader";

export default function FlowSection() {
  return (
    <section
      id="flow"
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
          eyebrow="How it works"
          title="A simple process when someone scans your plate"
          description="The flow section is broken into reusable cards so it can be edited, reordered, and reused more easily."
        />

        <div
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          <FlowCard
            step="1"
            title="Scan the plate"
            description="A person scans the Carascan QR plate attached to the caravan and lands on the secure public plate page."
          />
          <FlowCard
            step="2"
            title="Choose an action"
            description="They can contact the owner, report a location, or trigger an emergency alert depending on the situation."
          />
          <FlowCard
            step="3"
            title="Relay the message"
            description="Carascan routes the message to the owner and emergency contacts without revealing private personal details."
          />
        </div>
      </div>
    </section>
  );
}