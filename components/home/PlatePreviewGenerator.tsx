"use client";

import { useEffect, useMemo, useState } from "react";
import { buildPlatePreviewData } from "@/lib/platePreview";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

type PreviewSvgInput = {
  identifier: string;
  qrImageHref: string;
  mountingHoles: boolean;
  logoUrl?: string;
};

function buildPreviewSvg({
  identifier,
  qrImageHref,
  mountingHoles,
  logoUrl,
}: PreviewSvgInput): string {
  const widthMm = 90;
  const heightMm = 90;
  const cornerRadiusMm = 3;
  const holeDiameterMm = 5.2;

  const holes = [
    { x: 5, y: 5 },
    { x: 85, y: 5 },
    { x: 5, y: 85 },
    { x: 85, y: 85 },
  ];

  const logoWidth = 84;
  const logoHeight = 9.2;
  const logoCenterX = 45;
  const logoCenterY = 16;
  const logoX = logoCenterX - logoWidth / 2;
  const logoY = logoCenterY - logoHeight / 2;

  const qrSize = 50;
  const qrCenterX = 45;
  const qrCenterY = 51;
  const qrX = qrCenterX - qrSize / 2;
  const qrY = qrCenterY - qrSize / 2;

  const textX = 45;
  const textY = 82;
  const textFontSize = 4.2;

  const holeMarkup = mountingHoles
    ? `
      <g id="holes" fill="none" stroke="#111827" stroke-width="0.35">
        ${holes
          .map(
            (h) =>
              `<circle cx="${h.x}" cy="${h.y}" r="${holeDiameterMm / 2}" />`,
          )
          .join("\n")}
      </g>
    `
    : "";

  const logoMarkup = logoUrl
    ? `
      <image
        href="${esc(logoUrl)}"
        x="${logoX}"
        y="${logoY}"
        width="${logoWidth}"
        height="${logoHeight}"
        preserveAspectRatio="xMidYMid meet"
      />
    `
    : "";

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 ${widthMm} ${heightMm}"
      role="img"
      aria-label="Carascan plate preview"
    >
      <defs>
        <linearGradient id="plateGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f7f7f7" />
          <stop offset="45%" stop-color="#dfdfdf" />
          <stop offset="100%" stop-color="#cfcfcf" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="${widthMm}"
        height="${heightMm}"
        rx="${cornerRadiusMm}"
        ry="${cornerRadiusMm}"
        fill="url(#plateGradient)"
      />

      <rect
        x="0.25"
        y="0.25"
        width="${widthMm - 0.5}"
        height="${heightMm - 0.5}"
        rx="${cornerRadiusMm}"
        ry="${cornerRadiusMm}"
        fill="none"
        stroke="#111827"
        stroke-width="0.35"
      />

      ${holeMarkup}

      ${logoMarkup}

      <image
        href="${esc(qrImageHref)}"
        x="${qrX}"
        y="${qrY}"
        width="${qrSize}"
        height="${qrSize}"
        preserveAspectRatio="none"
      />

      <text
        x="${textX}"
        y="${textY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${textFontSize}"
        font-weight="500"
        fill="#111827"
      >${esc(identifier)}</text>
    </svg>
  `;
}

export default function PlatePreviewGenerator() {
  const [mountingHoles, setMountingHoles] = useState(true);
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
          mountingHoles,
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
  }, [mountingHoles]);

  const svgMarkup = useMemo(() => {
    if (!qrDataUrl) return "";
    return buildPreviewSvg({
      identifier: "CSN-XXXXXX",
      qrImageHref: qrDataUrl,
      mountingHoles,
      logoUrl: LOGO_URL,
    });
  }, [qrDataUrl, mountingHoles]);

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
        <div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 15,
              fontWeight: 600,
              color: "#0f172a",
              marginBottom: 18,
            }}
          >
            <input
              type="checkbox"
              checked={mountingHoles}
              onChange={(e) => setMountingHoles(e.target.checked)}
            />
            Include mounting holes
          </label>

          <div
            style={{
              background: "#e9e9ea",
              borderRadius: 28,
              padding: 20,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  minHeight: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475569",
                }}
              >
                Generating preview…
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  maxWidth: 430,
                }}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            )}
          </div>
        </div>

        <aside
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#2563eb",
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
              color: "#0f172a",
            }}
          >
            90 × 90 mm aluminium QR plate
          </h3>

          <p
            style={{
              margin: "0 0 18px 0",
              color: "#475569",
              lineHeight: 1.65,
              fontSize: 15,
            }}
          >
            This preview now follows the Fusion layout geometry for the locked
            Carascan plate format.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
              fontSize: 14,
              color: "#0f172a",
            }}
          >
            <div>
              <strong>Plate size:</strong> 90 × 90 mm
            </div>
            <div>
              <strong>Plate thickness:</strong> 3mm
            </div>
            <div>
              <strong>Material:</strong> Aluminium anodised plate
            </div>
            <div>
              <strong>Corner radius:</strong> 3 mm
            </div>
            <div>
              <strong>Identifier format:</strong> CSN-XXXXXX
            </div>
            <div>
              <strong>Mounting:</strong>{" "}
              {mountingHoles ? "HOLES - 5mm Aluminium pop rivets" : "NO HOLES - Adhesive required"}
            </div>
            <div>
              <strong>Hole diameter:</strong> 5.2 mm
            </div>
          
          
          </div>
        </aside>
      </div>
    </section>
  );
}