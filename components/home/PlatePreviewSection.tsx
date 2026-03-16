import PlatePreviewGenerator from "@/components/home/PlatePreviewGenerator";
import SectionHeader from "@/components/home/SectionHeader";

export default function PlatePreviewSection() {
  return (
    <section
      id="preview"
      style={{
        padding: "88px 20px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <SectionHeader
          eyebrow="Plate preview"
          title="Preview your Carascan plate"
          description="This section is split out so the plate preview can be edited independently and later connected to the locked manufacturing layout."
        />

        <div style={{ marginTop: 32 }}>
          <PlatePreviewGenerator />
        </div>
      </div>
    </section>
  );
}