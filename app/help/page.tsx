const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function HelpPage() {
  return (
    <>
      {/* 🔷 HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={LOGO_URL} alt="Carascan" style={{ height: 28 }} />
          </a>

          <a
            href="/buy"
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #111827",
            }}
          >
            Buy now
          </a>
        </div>
      </header>

      {/* 🔷 PAGE */}
      <main
        style={{
          minHeight: "calc(100vh - 61px)",
          background: "#f7f7f8",
          padding: "32px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {/* content will go here next */}
        </div>
      </main>
    </>
  );
}