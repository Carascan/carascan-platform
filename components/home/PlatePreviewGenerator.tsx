"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlatePreviewData } from "@/lib/platePreview";
import { buildPlateSvg } from "@/lib/laserSvg";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function PlatePreviewGenerator() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    let active = true;
    function handleResize() {
      setIsMobile(window.innerWidth <= 860);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
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
      window.removeEventListener("resize", handleResize);
    };
  }, []);

    const svgMarkup = useMemo(() => {
    if (!qrDataUrl) return "";

    const rawSvg = buildPlateSvg({
      identifier: "CSN-XXXXXX",
      qrImageHref: qrDataUrl,
      logoImageHref: LOGO_URL,
      includeCrosshair: false,
    });

    return rawSvg
      .replace(/width="[^"]*"/, 'width="100%"')
      .replace(/height="[^"]*"/, 'height="100%"')
      .replace(
        /<svg\b([^>]*)>/,
        '<svg$1 preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:100%;">'
      );
  }, [qrDataUrl]);

  return (
    <section id="preview" style={{ width: "100%" }}>
                        <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "minmax(0, 1fr)"
            : "minmax(320px, 520px) minmax(280px, 360px)",
          gap: isMobile ? 20 : 32,
          alignItems: "stretch",
          justifyContent: "center",
        }}
      >
                                        <div
          style={{
            padding: isMobile ? 0 : 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100%",
            height: "100%",
            order: isMobile ? 1 : 0,
          }}
        >
          {isLoading ? (
                        <div
              style={{
                minHeight: 100,
                height: "100%",
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
                height: "100%",
                maxWidth: isMobile ? 420 : 560,
                margin: "0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          )}
        </div>

                                <aside
          style={{
            padding: isMobile ? 20 : 24,
            background: "rgba(255,253,249,0.92)",
            border: "1px solid #D4CEC4",
            borderRadius: 18,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            height: "100%",
            order: isMobile ? 2 : 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C96A2B",
              marginBottom: 8,
            }}
          >
            Plate details
          </div>

          <h3
            style={{
                            fontSize: 28,
              lineHeight: 1.08,
              margin: "0 0 14px 0",
              color: "#1F2933",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            90 × 90 mm aluminium QR plate
          </h3>

          <p
            style={{
                            margin: "0 0 22px 0",
              color: "#5F5A54",
              lineHeight: 1.6,
              fontSize: 17,
            }}
          >
            This preview now uses the same locked SVG layout as the public and
            manufacturing plate output.
          </p>

          <div
            style={{
              display: "grid",
                            gap: 14,
              fontSize: 15,
              color: "#1F2933",
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Plate size:</strong> 90 × 90 mm
            </div>
            <div>
              <strong>Plate thickness:</strong> 3mm
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