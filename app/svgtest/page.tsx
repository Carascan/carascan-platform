export default function SvgTest() {
  const logoUrl =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

  const rawSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <rect x="10" y="10" width="220" height="220" fill="white" stroke="black" stroke-width="3"/>
  <text x="120" y="95" font-size="24" text-anchor="middle" fill="black">CARASCAN</text>
  <text x="120" y="130" font-size="18" text-anchor="middle" fill="black">SVG TEST</text>
  <circle cx="120" cy="170" r="14" fill="black"/>
</svg>`.trim();

  const downloadHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;

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
        <h1 style={{ marginTop: 0 }}>SVG Test</h1>
        <p style={{ color: "#4b5563" }}>
          This page tests inline SVG rendering, Supabase SVG loading, and SVG download.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginTop: 24,
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
            <h3 style={{ marginTop: 0 }}>Supabase logo SVG</h3>
            <img
              src={logoUrl}
              alt="Carascan logo"
              style={{
                width: "100%",
                maxWidth: 320,
                height: "auto",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Inline SVG test</h3>
            <div dangerouslySetInnerHTML={{ __html: rawSvg }} />
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Download test SVG</h3>
          <a
            href={downloadHref}
            download="carascan-svg-test.svg"
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
            Download SVG
          </a>
        </div>
      </div>
    </main>
  );
}