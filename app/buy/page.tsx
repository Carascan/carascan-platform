export default function Buy() {
  return (
    <main
      style={{
        minHeight: "100vh",
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
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg"
            alt="Carascan"
            style={{
              width: "100%",
              maxWidth: 360,
              height: "auto",
              display: "block",
              margin: "0 auto 20px",
            }}
          />

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 32,
              lineHeight: 1.1,
            }}
          >
            Buy Carascan Plate
          </h1>

          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: 16,
            }}
          >
            Smart QR plate for caravans and vehicles
          </p>
        </div>

        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 20,
            marginBottom: 22,
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 16 }}>
            <strong>Included</strong>
          </p>

          <div style={{ color: "#374151", lineHeight: 1.7 }}>
            <div>• Unique QR coded Carascan plate</div>
            <div>• 90 × 90 mm anodised aluminium plate with rivets</div>
            <div>• Customer setup page after purchase</div>
            <div>• 12 month contact maintenance subscription</div>
          </div>
        </div>

        <form action="/api/checkout/create" method="post">
          <button
            type="submit"
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              background: "#111827",
              color: "#ffffff",
            }}
          >
            Checkout
          </button>
        </form>

        <p
          style={{
            marginTop: 14,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Payment handled securely by Stripe Checkout
        </p>
      </div>
    </main>
  );
}