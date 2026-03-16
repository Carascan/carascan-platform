export default function NavBar() {
  const LOGO_URL =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

  return (
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
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={LOGO_URL}
            alt="Carascan"
            style={{
              height: 28,
              width: "auto",
              display: "block",
            }}
          />
        </a>

        <nav
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: 14,
            color: "#374151",
          }}
        >
          <a href="#preview" style={{ color: "inherit", textDecoration: "none" }}>
            Preview
          </a>

          <a href="#flow" style={{ color: "inherit", textDecoration: "none" }}>
            How it works
          </a>

          <a href="#details" style={{ color: "inherit", textDecoration: "none" }}>
            Details
          </a>

          <a
            href="/buy"
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            Buy now
          </a>
        </nav>
      </div>
    </header>
  );
}