"use client";

import PlatePreviewGenerator from "./PlatePreviewGenerator";
import SectionHeader from "@/components/home/SectionHeader";

export default function PlatePreviewSection() {
  return (
    <section
      id="preview"
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
          eyebrow="Plate preview"
          title="See exactly what your plate will look like"
          description="The preview below reflects the real production output — the same QR structure, layout, and identifier used in manufacturing."
          align="center"
          maxWidth={760}
        />

        <div
          style={{
            marginTop: 40,
            background: "#E7E2D8",
            border: "1px solid #D4CEC4",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          }}
        >
          <PlatePreviewGenerator />
        </div>
      </div>
    </section>
  );
}