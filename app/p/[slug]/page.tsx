"use client";

import { useEffect, useMemo, useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const CONTACT_CHAR_LIMIT = 500;
const REPORT_CHAR_LIMIT = 500;
const EMERGENCY_CHAR_LIMIT = 700;

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

type PlateResponse = {
  plate: {
    slug: string;
    identifier: string;
    contact_enabled: boolean;
    emergency_enabled: boolean;
    preferred_contact_channel?: string | null;
  };
  profile?: {
    caravan_name?: string | null;
    bio?: string | null;
    owner_photo_url?: string | null;
  } | null;
  design?: {
    qr_url?: string | null;
    logo_url?: string | null;
    mounting_holes?: boolean | null;
  } | null;
};

type PreviewSvgInput = {
  identifier: string;
  qrImageHref: string;
  mountingHoles: boolean;
  logoUrl?: string;
};

type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy_m: number | null;
};

function buildPreviewSvg({
  identifier,
  qrImageHref,
  mountingHoles,
  logoUrl,
}: PreviewSvgInput): string {
  const widthMm = 90;
  const heightMm = 90;
  const cornerRadiusMm = 3;
  const holeDiameterMm = 5.2;

  const holes = [
    { x: 5, y: 5 },
    { x: 85, y: 5 },
    { x: 5, y: 85 },
    { x: 85, y: 85 },
  ];

  const logoWidth = 84;
  const logoHeight = 9.2;
  const logoCenterX = 45;
  const logoCenterY = 16;
  const logoX = logoCenterX - logoWidth / 2;
  const logoY = logoCenterY - logoHeight / 2;

  const qrSize = 58.2;
  const qrCenterX = 45;
  const qrTop = 23.6;
  const qrX = qrCenterX - qrSize / 2;
  const qrY = qrTop;

  const textX = 45;
  const textFontSize = 4.2;
  const textBottom = 88;
  const textY = textBottom - textFontSize / 2;

  const holeMarkup = mountingHoles
    ? `
      <g id="holes" fill="none" stroke="#111827" stroke-width="0.35">
        ${holes
          .map(
            (h) =>
              `<circle cx="${h.x}" cy="${h.y}" r="${holeDiameterMm / 2}" />`
          )
          .join("\n")}
      </g>
    `
    : "";

  const logoMarkup = logoUrl
    ? `
      <image
        href="${esc(logoUrl)}"
        x="${logoX}"
        y="${logoY}"
        width="${logoWidth}"
        height="${logoHeight}"
        preserveAspectRatio="xMidYMid meet"
      />
    `
    : "";

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      viewBox="0 0 ${widthMm} ${heightMm}"
      role="img"
      aria-label="Carascan plate preview"
    >
      <defs>
        <linearGradient id="plateGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f7f7f7" />
          <stop offset="45%" stop-color="#dfdfdf" />
          <stop offset="100%" stop-color="#cfcfcf" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="${widthMm}"
        height="${heightMm}"
        rx="${cornerRadiusMm}"
        ry="${cornerRadiusMm}"
        fill="url(#plateGradient)"
      />

      <rect
        x="0.25"
        y="0.25"
        width="${widthMm - 0.5}"
        height="${heightMm - 0.5}"
        rx="${cornerRadiusMm}"
        ry="${cornerRadiusMm}"
        fill="none"
        stroke="#111827"
        stroke-width="0.35"
      />

      ${holeMarkup}

      ${logoMarkup}

      ${
        qrImageHref
          ? `
      <image
        href="${esc(qrImageHref)}"
        x="${qrX}"
        y="${qrY}"
        width="${qrSize}"
        height="${qrSize}"
        preserveAspectRatio="none"
      />
      `
          : `
      <rect
        x="${qrX}"
        y="${qrY}"
        width="${qrSize}"
        height="${qrSize}"
        fill="#ffffff"
        stroke="#111827"
        stroke-width="0.35"
      />
      `
      }

      <text
        x="${textX}"
        y="${textY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${textFontSize}"
        font-weight="500"
        fill="#111827"
      >${esc(identifier)}</text>
    </svg>
  `;
}

function mapsLink(loc: LocationSnapshot | null) {
  if (!loc) return "";
  return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
}

async function requestCurrentLocation(): Promise<LocationSnapshot> {
  if (!navigator.geolocation) {
    throw new Error("Location access is not supported on this device.");
  }

  return await new Promise<LocationSnapshot>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_m: Number.isFinite(position.coords.accuracy)
            ? Math.round(position.coords.accuracy)
            : null,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission was denied. Please allow location access and try again."
            )
          );
          return;
        }
        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(
            new Error("Your location could not be determined. Please try again.")
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(
            new Error("Location request timed out. Please try again.")
          );
          return;
        }
        reject(new Error(error.message || "Unable to access your location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

export default function PlatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<PlateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [openPanel, setOpenPanel] = useState<
    null | "contact" | "report-location" | "emergency"
  >(null);

  const [contactBusy, setContactBusy] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const [reportBusy, setReportBusy] = useState(false);
  const [reportStatus, setReportStatus] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [reportLocation, setReportLocation] = useState<LocationSnapshot | null>(null);

  const [emergencyBusy, setEmergencyBusy] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [emergencyLocation, setEmergencyLocation] = useState<LocationSnapshot | null>(null);

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

  const caravanName = data?.profile?.caravan_name?.trim() || "";
  const bio = data?.profile?.bio?.trim() || "";
  const identifier = data?.plate.identifier || "";
  const qrUrl = data?.design?.qr_url?.trim() || "";
  const logoUrl = data?.design?.logo_url?.trim() || LOGO_URL;
  const mountingHoles = data?.design?.mounting_holes !== false;

  const previewSvg = useMemo(() => {
    return buildPreviewSvg({
      identifier,
      qrImageHref: qrUrl,
      mountingHoles,
      logoUrl,
    });
  }, [identifier, qrUrl, mountingHoles, logoUrl]);

  const contactRemaining = CONTACT_CHAR_LIMIT - contactMessage.length;
  const reportRemaining = REPORT_CHAR_LIMIT - reportNotes.length;
  const emergencyRemaining = EMERGENCY_CHAR_LIMIT - emergencyMessage.length;

  const preferredChannelLabel = useMemo(() => {
    const channel = data?.plate.preferred_contact_channel || "email";
    if (channel === "both") return "email and SMS";
    if (channel === "sms") return "SMS";
    return "email";
  }, [data?.plate.preferred_contact_channel]);

  async function sendContactMessage() {
    if (!slug) return;

    setContactBusy(true);
    setContactStatus("");

    try {
      const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reporter_name: contactName,
          reporter_phone: contactPhone,
          reporter_email: contactEmail,
          message: contactMessage.trim(),
        }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setContactStatus(j?.error ?? "Failed to send message.");
        return;
      }

      setContactStatus("Message sent successfully.");
      setContactMessage("");
    } catch (err) {
      setContactStatus(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setContactBusy(false);
    }
  }

  async function captureReportLocation() {
    setReportBusy(true);
    setReportStatus("");

    try {
      const loc = await requestCurrentLocation();
      setReportLocation(loc);
      setReportStatus("Location captured successfully.");
    } catch (err) {
      setReportStatus(err instanceof Error ? err.message : "Failed to capture location.");
    } finally {
      setReportBusy(false);
    }
  }

  async function sendReportLocation() {
    if (!slug) return;

    setReportBusy(true);
    setReportStatus("");

    try {
      const loc = reportLocation ?? (await requestCurrentLocation());
      setReportLocation(loc);

      const message = [
        reportNotes.trim(),
        `Reported location: ${mapsLink(loc)}`,
        `Coordinates: ${loc.latitude}, ${loc.longitude}`,
        loc.accuracy_m ? `Accuracy: ${loc.accuracy_m}m` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/report-location`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reporter_name: reportName,
            reporter_phone: reportPhone,
            reporter_email: reportEmail,
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy_m: loc.accuracy_m,
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
      setReportNotes("");
    } catch (err) {
      setReportStatus(
        err instanceof Error ? err.message : "Failed to send location report."
      );
    } finally {
      setReportBusy(false);
    }
  }

  async function sendEmergencyAlert() {
    if (!slug) return;

    setEmergencyBusy(true);
    setEmergencyStatus("");

    try {
      const loc = emergencyLocation ?? (await requestCurrentLocation());
      setEmergencyLocation(loc);

      const message = [
        emergencyMessage.trim(),
        `Emergency location: ${mapsLink(loc)}`,
        `Coordinates: ${loc.latitude}, ${loc.longitude}`,
        loc.accuracy_m ? `Accuracy: ${loc.accuracy_m}m` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/emergency`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reporter_name: emergencyName,
          reporter_phone: emergencyPhone,
          reporter_email: emergencyEmail,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy_m: loc.accuracy_m,
          message,
        }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setEmergencyStatus(j?.error ?? "Failed to send emergency alert.");
        return;
      }

      setEmergencyStatus("Emergency alert sent successfully.");
      setEmergencyMessage("");
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
              <div
                style={styles.platePreviewFrame}
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            </div>

            <p style={styles.sub}>
              Secure contact and emergency access for <strong>{identifier}</strong>
            </p>

            {caravanName ? <p style={styles.caravanName}>{caravanName}</p> : null}
          </div>

          {bio ? (
            <div style={styles.bioBox}>
              <p style={styles.bioText}>{bio}</p>
            </div>
          ) : null}

          <div style={styles.actionBox}>
            <h3 style={styles.actionsHeading}>Actions</h3>

            <div style={styles.topButtonGrid}>
              {data.plate.contact_enabled ? (
                <button
                  type="button"
                  onClick={() =>
                    setOpenPanel(openPanel === "contact" ? null : "contact")
                  }
                  style={styles.primaryButton}
                >
                  {openPanel === "contact" ? "Hide Contact" : "Contact"}
                </button>
              ) : (
                <div style={styles.disabledBox}>Contact is disabled</div>
              )}

              <button
                type="button"
                onClick={() =>
                  setOpenPanel(
                    openPanel === "report-location" ? null : "report-location"
                  )
                }
                style={styles.secondaryButton}
              >
                {openPanel === "report-location"
                  ? "Hide Report Location"
                  : "Report Location"}
              </button>
            </div>

            {openPanel === "contact" && data.plate.contact_enabled ? (
              <div style={styles.panel}>
                <h3 style={{ marginTop: 0 }}>Contact Owner</h3>
                <p style={styles.sub}>
                  Send a short message to the owner via their selected contact
                  channel: <strong>{preferredChannelLabel}</strong>.
                </p>

                <div style={styles.fieldGrid}>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your name"
                    style={styles.input}
                  />
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Your phone"
                    style={styles.input}
                  />
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your email"
                    style={styles.input}
                  />
                  <textarea
                    value={contactMessage}
                    onChange={(e) =>
                      setContactMessage(e.target.value.slice(0, CONTACT_CHAR_LIMIT))
                    }
                    placeholder="Write your message"
                    rows={5}
                    style={styles.textarea}
                  />
                  <div style={styles.helperText}>
                    Maximum {CONTACT_CHAR_LIMIT} characters.
                    <span style={styles.counter}>{contactRemaining} remaining</span>
                  </div>
                </div>

                <div style={styles.singleButtonWrap}>
                  <button
                    type="button"
                    onClick={sendContactMessage}
                    disabled={contactBusy || !contactMessage.trim()}
                    style={styles.primaryButton}
                  >
                    {contactBusy ? "Sending..." : "Send Message"}
                  </button>
                </div>

                {contactStatus ? (
                  <div style={styles.statusBox}>{contactStatus}</div>
                ) : null}
              </div>
            ) : null}

            {openPanel === "report-location" ? (
              <div style={styles.panel}>
                <h3 style={{ marginTop: 0 }}>Report Location</h3>
                <p style={styles.sub}>
                  Location access is required. Capture GPS first, then send the report.
                </p>

                <div style={styles.fieldGrid}>
                  <input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Your name"
                    style={styles.input}
                  />
                  <input
                    value={reportPhone}
                    onChange={(e) => setReportPhone(e.target.value)}
                    placeholder="Your phone"
                    style={styles.input}
                  />
                  <input
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="Your email"
                    style={styles.input}
                  />
                  <textarea
                    value={reportNotes}
                    onChange={(e) =>
                      setReportNotes(e.target.value.slice(0, REPORT_CHAR_LIMIT))
                    }
                    placeholder="Optional note, address, campsite, road marker, or other location details"
                    rows={5}
                    style={styles.textarea}
                  />
                  <div style={styles.helperText}>
                    Maximum {REPORT_CHAR_LIMIT} characters.
                    <span style={styles.counter}>{reportRemaining} remaining</span>
                  </div>

                  {reportLocation ? (
                    <div style={styles.locationBox}>
                      <div><strong>Captured location</strong></div>
                      <div>{reportLocation.latitude}, {reportLocation.longitude}</div>
                      {reportLocation.accuracy_m ? (
                        <div>Accuracy: {reportLocation.accuracy_m}m</div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div style={styles.doubleButtonWrap}>
                  <button
                    type="button"
                    onClick={captureReportLocation}
                    disabled={reportBusy}
                    style={styles.secondaryButton}
                  >
                    {reportBusy ? "Requesting..." : "Capture My Location"}
                  </button>

                  <button
                    type="button"
                    onClick={sendReportLocation}
                    disabled={reportBusy || !reportLocation}
                    style={styles.primaryButton}
                  >
                    {reportBusy ? "Sending..." : "Send Location Report"}
                  </button>
                </div>

                {reportStatus ? (
                  <div style={styles.statusBox}>{reportStatus}</div>
                ) : null}
              </div>
            ) : null}

            {data.plate.emergency_enabled ? (
              <>
                <div style={styles.emergencyWrap}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenPanel(openPanel === "emergency" ? null : "emergency")
                    }
                    style={styles.emergencyButton}
                  >
                    {openPanel === "emergency"
                      ? "Hide Emergency Panel"
                      : "In Case of Emergency"}
                  </button>
                </div>

                {openPanel === "emergency" ? (
                  <div style={styles.panel}>
                    <h3 style={{ marginTop: 0 }}>Emergency Alert</h3>
                    <p style={styles.sub}>
                      Location access is required for emergency alerts.
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
                        onChange={(e) =>
                          setEmergencyMessage(
                            e.target.value.slice(0, EMERGENCY_CHAR_LIMIT)
                          )
                        }
                        placeholder="Describe the emergency"
                        rows={5}
                        style={styles.textarea}
                      />
                      <div style={styles.helperText}>
                        Maximum {EMERGENCY_CHAR_LIMIT} characters.
                        <span style={styles.counter}>
                          {emergencyRemaining} remaining
                        </span>
                      </div>

                      {emergencyLocation ? (
                        <div style={styles.locationBox}>
                          <div><strong>Captured emergency location</strong></div>
                          <div>{emergencyLocation.latitude}, {emergencyLocation.longitude}</div>
                          {emergencyLocation.accuracy_m ? (
                            <div>Accuracy: {emergencyLocation.accuracy_m}m</div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div style={styles.doubleButtonWrap}>
                      <button
                        type="button"
                        onClick={async () => {
                          setEmergencyBusy(true);
                          setEmergencyStatus("");
                          try {
                            const loc = await requestCurrentLocation();
                            setEmergencyLocation(loc);
                            setEmergencyStatus("Emergency location captured successfully.");
                          } catch (err) {
                            setEmergencyStatus(
                              err instanceof Error
                                ? err.message
                                : "Failed to capture emergency location."
                            );
                          } finally {
                            setEmergencyBusy(false);
                          }
                        }}
                        disabled={emergencyBusy}
                        style={styles.secondaryButton}
                      >
                        {emergencyBusy ? "Requesting..." : "Capture Emergency Location"}
                      </button>

                      <button
                        type="button"
                        onClick={sendEmergencyAlert}
                        disabled={emergencyBusy || !emergencyLocation}
                        style={styles.emergencyButton}
                      >
                        {emergencyBusy ? "Sending..." : "Send Emergency Alert"}
                      </button>
                    </div>

                    {emergencyStatus ? (
                      <div style={styles.statusBox}>{emergencyStatus}</div>
                    ) : null}
                  </div>
                ) : null}
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
  platePreviewFrame: {
    width: 430,
    maxWidth: "100%",
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
  panel: {
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
  helperText: {
    fontSize: 13,
    color: "#6b7280",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  counter: {
    color: "#374151",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  singleButtonWrap: {
    display: "flex",
    justifyContent: "center",
  },
  doubleButtonWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  locationBox: {
    padding: 14,
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    color: "#111827",
    lineHeight: 1.6,
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