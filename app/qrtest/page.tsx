"use client";

import { useMemo, useState } from "react";

function buildSimpleQrSvg(text: string) {
  // This is a fast demo SVG generator, not a standards-compliant QR encoder.
  // Good for visual workflow testing only.
  const size = 29;
  const cell = 8;
  const pad = 4;
  const total = (size + pad * 2) * cell;

  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }

  function rand() {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const cells: string[] = [];

  const isFinder = (x: number, y: number) => {
    const tl = x < 7 && y < 7;
    const tr = x >= size - 7 && y < 7;
    const bl = x < 7 && y >= size - 7;
    return tl || tr || bl;
  };

  const finderSvg = (ox: number, oy: number) => `
    <rect x="${(ox + pad) * cell}" y="${(oy + pad) * cell}" width="${7 * cell}" height="${7 * cell}" fill="black"/>
    <rect x="${(ox + pad + 1) * cell}" y="${(oy + pad + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="white"/>
    <rect x="${(ox + pad + 2) * cell}" y="${(oy + pad + 2) * cell}" width="${3 * cell}" height="${3 * cell}" fill="black"/>
  `;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) continue;
      if (rand() > 0.5) {
        cells.push(
          `<rect x="${(x + pad) * cell}" y="${(y + pad) * cell}" width="${cell}" height="${cell}" fill="black"/>`
        );
      }
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
  <rect width="${total}" height="${total}" fill="white"/>
  ${finderSvg(0, 0)}
  ${finderSvg(size - 7, 0)}
  ${finderSvg(0, size - 7)}
  ${cells.join("\n")}
</svg>`.trim();
}

export default function QrTestPage() {
  const [value, setValue] = useState("https://carascan.com.au/p/demo-plate");

  const svg = useMemo(() => buildSimpleQrSvg(value), [value]);

  const downloadHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1 style={{ marginTop: 0 }}>QR SVG Generator Test</h1>
        <p style={{ color: "#4b5563" }}>
          This is a quick visual QR-style SVG generator for testing the workflow.
        </p>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 20,
            marginTop: 20,
          }}
        >
          <label
            htmlFor="qrvalue"
            style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
          >
            URL / text
          </label>
          <input
            id="qrvalue"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 15,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Rendered SVG</h3>
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Download</h3>
            <a
              href={downloadHref}
              download="carascan-qr-test.svg"
              style={{
                display: "inline-block",
                textDecoration: "none",
                borderRadius: 10,
                padding: "12px 18px",
                background: "#111827",
                color: "#ffffff",
                fontWeight: 600,
              }}
            >
              Download QR SVG
            </a>

            <p style={{ marginTop: 16, color: "#6b7280", fontSize: 14 }}>
              This is a visual test SVG for demo workflow, not a production QR encoder.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}