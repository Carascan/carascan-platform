export default function NavBar() {
  const LOGO_URL =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(20,26,32,0.94)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #2B3138",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 20px", // reduced slightly to balance height
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          minHeight: 72, // 🔥 forces clean vertical centering zone
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <img
            src={LOGO_URL}
            alt="Carascan"
            style={{
              height: 44,
              width: "auto",
              display: "block",
              filter: "brightness(0) invert(1)",
            }}
          />
        </a>

        <nav
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            fontSize: 14,
            color: "#F3F1EC",
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
              background: "#C96A2B",
              color: "#FFFFFF",
              padding: "10px 16px",
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            }}
          >
            Buy now
          </a>
        </nav>
      </div>
    </header>
  );
}