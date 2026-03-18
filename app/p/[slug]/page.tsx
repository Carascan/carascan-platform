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
    caravan_name?: string | null;
    bio?: string | null;
    owner_photo_url?: string | null;
  } | null;
  design?: {
    qr_url?: string | null;
    logo_url?: string | null;
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
  const [showEmergency, setShowEmergency] = useState(false);

  const [reportBusy, setReportBusy] = useState(false);
  const [reportStatus, setReportStatus] = useState("");

  const [emergencyBusy, setEmergencyBusy] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");

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

    setReportBusy(true);
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
      setReportBusy(false);
    }
  }

  async function useMyLocation() {
    if (!slug) return;

    setReportStatus("");

    if (!navigator.geolocation) {
      setReportStatus("Geolocation is not supported on this device.");
      return;
    }

    setReportBusy(true);

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
          setReportBusy(false);
        }
      },
      (error) => {
        setReportBusy(false);
        setReportStatus(error.message || "Unable to access your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function sendEmergencyAlert() {
    if (!slug) return;

    setEmergencyBusy(true);
    setEmergencyStatus("");

    try {
      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/emergency`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reporter_name: emergencyName,
            reporter_phone: emergencyPhone,
            reporter_email: emergencyEmail,
            message: emergencyMessage,
          }),
        }
      );

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setEmergencyStatus(j?.error ?? "Failed to send emergency alert.");
        return;
      }

      setEmergencyStatus("Emergency alert sent successfully.");
    } catch (err) {
      setEmergencyStatus(
        err instanceof Error ? err.message : "Failed to send emergency alert."
      );
    } finally {
      setEmergencyBusy(false);
    }
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

  const caravanName = data.profile?.caravan_name?.trim() || "";
  const bio = data.profile?.bio?.trim() || "";
  const identifier = data.plate.identifier;
  const qrUrl = data.design?.qr_url || "";
  const plateLogoUrl = data.design?.logo_url?.trim() || LOGO_URL;

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
                maxWidth: 390,
                height: "auto",
                display: "block",
                margin: "0 auto 18px",
              }}
            />

            <div style={styles.platePreviewWrap}>
              <PlatePreview
                identifier={identifier}
                qrUrl={qrUrl}
                logoUrl={plateLogoUrl}
              />
            </div>

            <p style={styles.sub}>
              Secure contact and emergency access for <strong>{identifier}</strong>
            </p>

            {caravanName ? <p style={styles.caravanName}>{caravanName}</p> : null}
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

          {bio ? (
            <div style={styles.bioBox}>
              <p style={styles.bioText}>{bio}</p>
            </div>
          ) : null}

          <div style={styles.actionBox}>
            <h3 style={styles.actionsHeading}>Actions</h3>

            <div style={styles.topButtonGrid}>
              {data.plate.contact_enabled ? (
                <a href={`/p/${slug}/contact`} style={styles.primaryLink}>
                  Contact
                </a>
              ) : (
                <div style={styles.disabledBox}>Contact is disabled</div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowReportLocation((v) => !v);
                  if (showEmergency) setShowEmergency(false);
                }}
                style={styles.secondaryButton}
              >
                {showReportLocation ? "Hide Report Location" : "Report Location"}
              </button>
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

                <div style={styles.topButtonGrid}>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={reportBusy}
                    style={styles.primaryButton}
                  >
                    {reportBusy ? "Sending..." : "Use My Current Location"}
                  </button>

                  <button
                    type="button"
                    onClick={sendManualReport}
                    disabled={reportBusy}
                    style={styles.secondaryButton}
                  >
                    {reportBusy ? "Sending..." : "Send Manual Report"}
                  </button>
                </div>

                {reportStatus ? (
                  <div style={styles.statusBox}>{reportStatus}</div>
                ) : null}
              </div>
            )}

            {data.plate.emergency_enabled ? (
              <>
                <div style={styles.emergencyWrap}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmergency((v) => !v);
                      if (showReportLocation) setShowReportLocation(false);
                    }}
                    style={styles.emergencyButton}
                  >
                    {showEmergency ? "Hide Emergency Panel" : "In Case of Emergency"}
                  </button>
                </div>

                {showEmergency && (
                  <div style={styles.reportPanel}>
                    <h3 style={{ marginTop: 0 }}>Emergency Alert</h3>
                    <p style={styles.sub}>
                      Send an emergency alert to the owner and emergency contacts.
                    </p>

                    <div style={styles.fieldGrid}>
                      <input
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Your name"
                        style={styles.input}
                      />
                      <input
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="Your phone"
                        style={styles.input}
                      />
                      <input
                        value={emergencyEmail}
                        onChange={(e) => setEmergencyEmail(e.target.value)}
                        placeholder="Your email"
                        style={styles.input}
                      />
                      <textarea
                        value={emergencyMessage}
                        onChange={(e) => setEmergencyMessage(e.target.value)}
                        placeholder="Describe the emergency"
                        rows={5}
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.emergencyWrap}>
                      <button
                        type="button"
                        onClick={sendEmergencyAlert}
                        disabled={emergencyBusy}
                        style={styles.emergencyButton}
                      >
                        {emergencyBusy ? "Sending..." : "Send Emergency Alert"}
                      </button>
                    </div>

                    {emergencyStatus ? (
                      <div style={styles.statusBox}>{emergencyStatus}</div>
                    ) : null}
                  </div>
                )}
              </>
            ) : (
              <div style={styles.emergencyWrap}>
                <div style={styles.disabledBox}>Emergency is disabled</div>
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

function PlatePreview({
  identifier,
  qrUrl,
  logoUrl,
}: {
  identifier: string;
  qrUrl: string;
  logoUrl: string;
}) {
  return (
    <div style={styles.platePreview}>
      <div style={styles.plateTexture} />
      <div style={styles.plateInner}>
        <img src={logoUrl} alt="Plate logo" style={styles.plateLogo} />
        {qrUrl ? (
          <img src={qrUrl} alt="Plate QR" style={styles.plateQr} />
        ) : (
          <div style={styles.plateQrFallback}>QR</div>
        )}
        <div style={styles.plateIdentifier}>{identifier}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    background: "#f7f7f8",
    fontFamily: "Arial, sans-serif",
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
  platePreviewWrap: {
    display: "flex",
    justifyContent: "center",
    margin: "0 auto 18px",
  },
  platePreview: {
    position: "relative",
    width: 180,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    boxSizing: "border-box",
    border: "1px solid #7b7b7b",
    background:
      "linear-gradient(145deg, #d9d9d9 0%, #c8c8c8 22%, #efefef 50%, #c2c2c2 78%, #dadada 100%)",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.12)",
  },
  plateTexture: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 1px, rgba(0,0,0,0.03) 2px, rgba(255,255,255,0.02) 4px)",
    opacity: 0.55,
    pointerEvents: "none",
  },
  plateInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  plateLogo: {
    position: "absolute",
    top: 14,
    left: "50%",
    transform: "translateX(-50%)",
    width: 118,
    height: "auto",
    objectFit: "contain",
  },
  plateQr: {
    position: "absolute",
    width: 100,
    height: 100,
    left: "50%",
    top: 58,
    transform: "translateX(-50%)",
    objectFit: "cover",
    background: "#fff",
  },
  plateQrFallback: {
    position: "absolute",
    width: 100,
    height: 100,
    left: "50%",
    top: 58,
    transform: "translateX(-50%)",
    border: "1px solid #111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    background: "#fff",
  },
  plateIdentifier: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    color: "#111827",
    whiteSpace: "nowrap",
  },
  sub: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.6,
  },
  caravanName: {
    margin: "10px 0 0 0",
    color: "#111827",
    fontSize: 22,
    fontWeight: 700,
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
  actionsHeading: {
    marginTop: 0,
    marginBottom: 14,
    textAlign: "center",
  },
  topButtonGrid: {
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
  emergencyWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: 18,
  },
  emergencyButton: {
    border: 0,
    borderRadius: 12,
    padding: "16px 20px",
    minWidth: 280,
    fontSize: 16,
    fontWeight: 700,
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
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