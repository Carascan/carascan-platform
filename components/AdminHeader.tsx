// components/AdminHeader.tsx
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
    </div>
  );
}