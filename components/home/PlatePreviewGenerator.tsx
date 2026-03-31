"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlatePreviewData } from "@/lib/platePreview";
import { buildPlateSvg } from "@/lib/laserSvg";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function PlatePreviewGenerator() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setIsLoading(true);

        const preview = await buildPlatePreviewData({
          slug: "preview-demo",
          identifier: "CSN-XXXXXX",
          logoUrl: LOGO_URL,
        });

        if (!active) return;
        setQrDataUrl(preview.qrDataUrl);
      } catch (error) {
        console.error("Failed to generate plate preview", error);
        if (!active) return;
        setQrDataUrl("");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, []);

  const svgMarkup = useMemo(() => {
    if (!qrDataUrl) return "";

    return buildPlateSvg({
      identifier: "CSN-XXXXXX",
      qrImageHref: qrDataUrl,
      logoImageHref: LOGO_URL,
      includeCrosshair: false,
    });
  }, [qrDataUrl]);

  return (
    <section id="preview" style={{ width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 560px) minmax(260px, 360px)",
          gap: 28,
          alignItems: "start",
        }}
      >
        <div
          style={{
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <div
              style={{
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5F5A54",
                width: "100%",
              }}
            >
              Generating preview…
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                maxWidth: 430,
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
              }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          )}
        </div>

        <aside
          style={{
            padding: 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C96A2B",
              marginBottom: 10,
            }}
          >
            Plate details
          </div>

          <h3
            style={{
              fontSize: 22,
              lineHeight: 1.2,
              margin: "0 0 12px 0",
              color: "#1F2933",
            }}
          >
            90 × 90 mm aluminium QR plate
          </h3>

          <p
            style={{
              margin: "0 0 18px 0",
              color: "#5F5A54",
              lineHeight: 1.65,
              fontSize: 15,
            }}
          >
            This preview now uses the same locked SVG layout as the public and
            manufacturing plate output.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
              fontSize: 14,
              color: "#1F2933",
            }}
          >
            <div>
              <strong>Plate size:</strong> 90 × 90 mm
            </div>
            <div>
              <strong>Plate thickness:</strong> 2mm
            </div>
            <div>
              <strong>Material:</strong> Aluminium plate - Clear powdercoated
            </div>
            <div>
              <strong>Corner radius:</strong> 3mm fillet
            </div>
            <div>
              <strong>Identifier format:</strong> CSN-XXXXXX
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}