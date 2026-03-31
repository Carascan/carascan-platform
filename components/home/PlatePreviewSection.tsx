"use client";

import PlatePreviewGenerator from "./PlatePreviewGenerator";
import SectionHeader from "@/components/home/SectionHeader";

export default function PlatePreviewSection() {
  return (
    <section
      id="preview"
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
          eyebrow="Plate preview"
          title="See exactly what your plate will look like"
          description="The preview below reflects the real production output — the same QR structure, layout, and identifier used in manufacturing."
          align="center"
          maxWidth={760}
        />

        <div
          style={{
            marginTop: 40,
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <PlatePreviewGenerator />
        </div>
      </div>
    </section>
  );
}