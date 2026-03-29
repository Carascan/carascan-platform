const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function Success() {
  return (
    <>
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

          <a
            href="/contact"
            style={{
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              background: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            Help
          </a>
        </div>
      </header>

      <main
        style={{
          minHeight: "calc(100vh - 61px)",
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
          background: "#f7f7f8",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 32,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: 32,
              marginBottom: 18,
            }}
          >
            Order confirmed
          </h1>

          <p
            style={{
              fontSize: 16,
              marginBottom: 10,
              color: "#374151",
            }}
          >
            Time to hit the road! Your order is confirmed. Thank you for
            contributing to the community and looking out for each other.
          </p>

          <p
            style={{
              fontSize: 16,
              marginBottom: 10,
              color: "#374151",
            }}
          >
            We’ve emailed you a secure setup link to configure your plate page
            and emergency contacts.
          </p>

          <p
            style={{
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            If you don’t see the email, check your spam or junk folder.
          </p>
        </div>
      </main>
    </>
  );
}