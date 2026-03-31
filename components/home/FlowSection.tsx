import FlowCard from "@/components/home/FlowCard";
import SectionHeader from "@/components/home/SectionHeader";

export default function FlowSection() {
  return (
    <section
      id="flow"
      style={{
        padding: "88px 20px",
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
          eyebrow="How it works"
          title="No apps. No signups. By scanning the plate, you can either contact the owner or there loved ones in an emergency"
          description="The best part about this community is that we all have a common thread. We're social, we like to travel, but we all look out for each other. "
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
            description="A person scans the Carascan QR plate attached to the caravan and lands on the secure public plate page where you can fill out your details, provide GPS postion, and a message."
          />
          <FlowCard
            step="2"
            title="Choose an action"
            description="Use the 'virtual doorknock'function, report the location if something feels off, or raise an alarm in an emergency"
          />
          <FlowCard
            step="3"
            title="Relay the message"
            description="In an emergency Carascan sends an email and SMS to the owners emergency contacts, so the can be assured they have a friend right there. The owner chooses how they recieve other alerts."
          />
        </div>
      </div>
    </section>
  );
}