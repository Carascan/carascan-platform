"use client";

import PlatePreviewGenerator from "./PlatePreviewGenerator";
import SectionHeader from "@/components/home/SectionHeader";

const DEMO_IDENTIFIER = "CSN-000001";
const DEMO_QR_IMAGE_HREF =
  "https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=https%3A%2F%2Fcarascan.com.au%2Fp%2Fdemo";
const DEMO_LOGO_IMAGE_HREF =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function PlatePreviewSection() {
  return (
    <section
      id="preview"
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
          eyebrow="Plate preview"
          title="See exactly what your plate will look like"
          description="The preview below reflects the real production output — the same QR structure, layout, and identifier used in manufacturing."
          align="center"
          maxWidth={760}
        />

        <div
          style={{
            marginTop: 18,
          }}
        >
          <PlatePreviewGenerator
            identifier={DEMO_IDENTIFIER}
            qrImageHref={DEMO_QR_IMAGE_HREF}
            logoImageHref={DEMO_LOGO_IMAGE_HREF}
          />
        </div>
      </div>
    </section>
  );
}