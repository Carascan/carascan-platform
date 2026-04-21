type AdminHeaderProps = {
  title: string;
  subtitle?: string;
};

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function AdminHeader({
  title,
  subtitle,
}: AdminHeaderProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <img
        src={LOGO_URL}
        alt="Carascan"
        style={{
          width: "100%",
          maxWidth: 340,
          height: "auto",
          display: "block",
          margin: "0 auto 18px",
        }}
      />

      <h1 style={{ margin: "0 0 10px", fontSize: 32 }}>{title}</h1>

      {subtitle ? (
        <p style={{ margin: 0, color: "#4b5563" }}>{subtitle}</p>
      ) : null}

      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <a
          href="/admin/orders"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#111827",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Admin
        </a>

        <a
          href="/admin/vip"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111827",
            background: "#111827",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          VIP
        </a>
      </div>
    </div>
  );
}