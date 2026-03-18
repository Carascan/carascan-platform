import { notFound } from "next/navigation";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

async function getPlate(slug: string) {
  const baseUrl = process.env.APP_BASE_URL || "https://carascan.com.au";

  const r = await fetch(
    `${baseUrl}/api/plates/${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (!r.ok) return null;
  return r.json();
}

export default async function PlatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPlate(slug);

  if (!data) return notFound();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
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

            <h1 style={{ margin: "0 0 10px", fontSize: 32 }}>
              Carascan Plate
            </h1>
            <p style={{ margin: 0, color: "#4b5563" }}>
              Secure contact and emergency access for this plate.
            </p>
          </div>

          {data.profile?.owner_photo_url ? (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img
                src={data.profile.owner_photo_url}
                alt="Profile"
                style={{
                  width: 140,
                  height: 140,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                }}
              />
            </div>
          ) : null}

          {data.profile?.bio ? (
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 18,
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#374151",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {data.profile.bio}
              </p>
            </div>
          ) : null}

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 14 }}>Actions</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {data.plate.contact_enabled ? (
                <a
                  href={`/p/${slug}/contact`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                    border: 0,
                    borderRadius: 12,
                    padding: "16px 20px",
                    fontSize: 16,
                    fontWeight: 600,
                    background: "#111827",
                    color: "#ffffff",
                  }}
                >
                  Contact
                </a>
              ) : (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "16px 20px",
                    color: "#6b7280",
                    background: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  Contact is disabled
                </div>
              )}

              <a
                href={`/p/${slug}/report-location`}
                style={{
                  display: "block",
                  textAlign: "center",
                  textDecoration: "none",
                  border: "1px solid #d1d5db",
                  borderRadius: 12,
                  padding: "16px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  background: "#ffffff",
                  color: "#111827",
                }}
              >
                Report Location
              </a>

              {data.plate.emergency_enabled ? (
                <a
                  href={`/p/${slug}/emergency`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    textDecoration: "none",
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    padding: "16px 20px",
                    fontSize: 16,
                    fontWeight: 600,
                    background: "#fff7ed",
                    color: "#9a3412",
                  }}
                >
                  In Case of Emergency
                </a>
              ) : (
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "16px 20px",
                    color: "#6b7280",
                    background: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  Emergency is disabled
                </div>
              )}
            </div>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            Owner details are not displayed publicly. Messages are relayed securely.
          </p>
        </div>
      </div>
    </main>
  );
}