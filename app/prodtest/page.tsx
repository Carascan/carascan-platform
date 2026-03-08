"use client";

import { useState } from "react";

export default function ProdTestPage() {
  const [plateId, setPlateId] = useState("2b4f1553-7f26-4e69-9a36-4cef6eddd0c7");
  const [slug, setSlug] = useState("");
  const [token, setToken] = useState("");

  const appBase =
    typeof window !== "undefined" ? window.location.origin : "https://www.carascan.com.au";

  const laserPackUrl = plateId ? `${appBase}/api/laser-pack/${encodeURIComponent(plateId)}` : "#";
  const publicPlateUrl = slug ? `${appBase}/p/${encodeURIComponent(slug)}` : "#";
  const setupUrl = token ? `${appBase}/setup/${encodeURIComponent(token)}` : "#";

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
        <h1 style={{ marginTop: 0 }}>Carascan Production Test</h1>
        <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
          Use this page to test the real live workflow with actual plate IDs, slugs and setup tokens.
        </p>

        <div style={cardStyle}>
          <h3 style={h3Style}>1. Real engraving SVG export</h3>
          <label style={labelStyle}>Plate ID</label>
          <input
            value={plateId}
            onChange={(e) => setPlateId(e.target.value)}
            placeholder="Paste real plate_id from Supabase"
            style={inputStyle}
          />

          <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={laserPackUrl} target="_blank" rel="noreferrer" style={primaryLinkStyle}>
              Open laser SVG
            </a>
            <a href={laserPackUrl} download style={secondaryLinkStyle}>
              Download laser SVG
            </a>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={h3Style}>2. Real public QR landing page</h3>
          <label style={labelStyle}>Plate slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Paste real slug from plates table"
            style={inputStyle}
          />

          <div style={{ marginTop: 14 }}>
            <a
              href={publicPlateUrl}
              target="_blank"
              rel="noreferrer"
              style={primaryLinkStyle}
            >
              Open public plate page
            </a>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={h3Style}>3. Real customer setup page</h3>
          <label style={labelStyle}>Setup token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste real setup token from plate_setup_tokens"
            style={inputStyle}
          />

          <div style={{ marginTop: 14 }}>
            <a href={setupUrl} target="_blank" rel="noreferrer" style={primaryLinkStyle}>
              Open customer setup page
            </a>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 style={h3Style}>4. Full live workflow checklist</h3>
          <ol style={{ lineHeight: 1.8, color: "#374151", paddingLeft: 20 }}>
            <li>Go to <strong>/buy</strong> and complete Stripe sandbox checkout</li>
            <li>Confirm redirect to <strong>/order/success</strong></li>
            <li>Check Supabase tables for new rows in <strong>plates</strong>, <strong>plate_designs</strong>, <strong>orders</strong>, and <strong>plate_setup_tokens</strong></li>
            <li>Copy the new <strong>slug</strong>, <strong>plate_id</strong>, and <strong>setup token</strong> into this page</li>
            <li>Open the real setup page and save customer details</li>
            <li>Open the real public plate page</li>
            <li>Open/download the real engraving SVG</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
  marginTop: 20,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
};

const h3Style: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  background: "#ffffff",
  boxSizing: "border-box",
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  borderRadius: 10,
  padding: "12px 18px",
  background: "#111827",
  color: "#ffffff",
  fontWeight: 600,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  borderRadius: 10,
  padding: "12px 18px",
  background: "#ffffff",
  color: "#111827",
  fontWeight: 600,
  border: "1px solid #d1d5db",
};