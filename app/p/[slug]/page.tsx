"use client";

import { useEffect, useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

type PlateResponse = {
  plate: {
    slug: string;
    identifier: string;
    contact_enabled: boolean;
    emergency_enabled: boolean;
  };
  profile?: {
    bio?: string | null;
    owner_photo_url?: string | null;
  } | null;
};

export default function PlatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<PlateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showReportLocation, setShowReportLocation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reportStatus, setReportStatus] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    let mounted = true;

    async function init() {
      const resolved = await params;
      if (!mounted) return;
      setSlug(resolved.slug);

      try {
        const r = await fetch(`/api/plates/${encodeURIComponent(resolved.slug)}`, {
          cache: "no-store",
        });

        if (!r.ok) {
          setLoadError("Plate not found.");
          setLoading(false);
          return;
        }

        const j = await r.json();
        if (!mounted) return;

        setData(j);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load plate.");
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [params]);

  async function sendManualReport() {
    if (!slug) return;

    setBusy(true);
    setReportStatus("");

    try {
      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/report-location`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reporter_name: name,
            reporter_phone: phone,
            reporter_email: email,
            message: notes,
          }),
        }
      );

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setReportStatus(j?.error ?? "Failed to send report.");
        return;
      }

      setReportStatus("Location report sent successfully.");
    } catch (err) {
      setReportStatus(err instanceof Error ? err.message : "Failed to send report.");
    } finally {
      setBusy(false);
    }
  }

  async function useMyLocation() {
    if (!slug) return;

    setReportStatus("");

    if (!navigator.geolocation) {
      setReportStatus("Geolocation is not supported on this device.");
      return;
    }

    setBusy(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 0);

          const message = [
            notes.trim(),
            `Reported location: https://maps.google.com/?q=${lat},${lng}`,
            `Coordinates: ${lat}, ${lng}`,
            accuracy ? `Accuracy: ${accuracy}m` : "",
          ]
            .filter(Boolean)
            .join("\n\n");

          const r = await fetch(
            `/api/plates/${encodeURIComponent(slug)}/report-location`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                reporter_name: name,
                reporter_phone: phone,
                reporter_email: email,
                latitude: lat,
                longitude: lng,
                accuracy_m: accuracy || null,
                message,
              }),
            }
          );

          const j = await r.json().catch(() => null);

          if (!r.ok) {
            setReportStatus(j?.error ?? "Failed to send location report.");
            return;
          }

          setReportStatus("Location report sent successfully.");
        } catch (err) {
          setReportStatus(
            err instanceof Error ? err.message : "Failed to send location report."
          );
        } finally {
          setBusy(false);
        }
      },
      (error) => {
        setBusy(false);
        setReportStatus(error.message || "Unable to access your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.card}>Loading...</div>
        </div>
      </main>
    );
  }

  if (loadError || !data) {
    return (
      <main style={styles.page}>
        <div style={styles.wrap}>
          <div style={styles.card}>{loadError || "Plate not found."}</div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.card}>
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

            <h1 style={styles.h1}>Carascan Plate</h1>
            <p style={styles.sub}>
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
            <div style={styles.bioBox}>
              <p style={styles.bioText}>{data.profile.bio}</p>
            </div>
          ) : null}

          <div style={styles.actionBox}>
            <h3 style={{ marginTop: 0, marginBottom: 14 }}>Actions</h3>

            <div style={styles.buttonGrid}>
              {data.plate.contact_enabled ? (
                <a href={`/p/${slug}/contact`} style={styles.primaryLink}>
                  Contact
                </a>
              ) : (
                <div style={styles.disabledBox}>Contact is disabled</div>
              )}

              <button
                type="button"
                onClick={() => setShowReportLocation((v) => !v)}
                style={styles.secondaryButton}
              >
                {showReportLocation ? "Hide Report Location" : "Report Location"}
              </button>

              {data.plate.emergency_enabled ? (
                <a href={`/p/${slug}/emergency`} style={styles.emergencyLink}>
                  In Case of Emergency
                </a>
              ) : (
                <div style={styles.disabledBox}>Emergency is disabled</div>
              )}
            </div>

            {showReportLocation && (
              <div style={styles.reportPanel}>
                <h3 style={{ marginTop: 0 }}>Report Location</h3>
                <p style={styles.sub}>
                  Share the current location of this caravan with the owner. You
                  can allow GPS access or send a manual note.
                </p>

                <div style={styles.fieldGrid}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={styles.input}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your phone"
                    style={styles.input}
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    style={styles.input}
                  />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional note, address, campsite, road marker, or other location details"
                    rows={5}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.buttonGrid}>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={busy}
                    style={styles.primaryButton}
                  >
                    {busy ? "Sending..." : "Use My Current Location"}
                  </button>

                  <button
                    type="button"
                    onClick={sendManualReport}
                    disabled={busy}
                    style={styles.secondaryButton}
                  >
                    {busy ? "Sending..." : "Send Manual Report"}
                  </button>
                </div>

                {reportStatus ? (
                  <div style={styles.statusBox}>{reportStatus}</div>
                ) : null}
              </div>
            )}
          </div>

          <p style={styles.footer}>
            Owner details are not displayed publicly. Messages are relayed securely.
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "#f7f7f8",
  },
  wrap: {
    maxWidth: 760,
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  },
  h1: {
    margin: "0 0 10px",
    fontSize: 32,
  },
  sub: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  bioBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },
  bioText: {
    margin: 0,
    color: "#374151",
    lineHeight: 1.6,
    textAlign: "center",
  },
  actionBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  primaryLink: {
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
  },
  emergencyLink: {
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
  },
  disabledBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px 20px",
    color: "#6b7280",
    background: "#ffffff",
    textAlign: "center",
  },
  primaryButton: {
    border: 0,
    borderRadius: 12,
    padding: "16px 20px",
    fontSize: 16,
    fontWeight: 600,
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "16px 20px",
    fontSize: 16,
    fontWeight: 600,
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
  },
  reportPanel: {
    marginTop: 18,
    paddingTop: 18,
    borderTop: "1px solid #e5e7eb",
    display: "grid",
    gap: 14,
  },
  fieldGrid: {
    display: "grid",
    gap: 12,
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 15,
    boxSizing: "border-box",
    resize: "vertical",
  },
  statusBox: {
    padding: 14,
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#111827",
  },
  footer: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
};