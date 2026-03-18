"use client";

import { useState } from "react";

export default function ReportLocationPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleUseMyLocation() {
    setStatus("");
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported on this device.");
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

          const j = await r.json();

          if (!r.ok) {
            setStatus(j?.error ?? "Failed to report location.");
            return;
          }

          setStatus("Location report sent successfully.");
        } catch (err) {
          setStatus(err instanceof Error ? err.message : "Failed to report location.");
        } finally {
          setBusy(false);
        }
      },
      (error) => {
        setBusy(false);
        setStatus(error.message || "Unable to access your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

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

      const j = await r.json();

      if (!r.ok) {
        setStatus(j?.error ?? "Failed to send report.");
        return;
      }

      setStatus("Location report sent successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to send report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f7f7f8",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 30 }}>
            Report Location
          </h1>
          <p style={{ marginTop: 0, color: "#4b5563", lineHeight: 1.6 }}>
            Share the current location of this caravan with the owner. You can
            use your device GPS or send a manual note.
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
              marginTop: 20,
              marginBottom: 24,
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone"
              style={inputStyle}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              style={inputStyle}
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note, address, campsite, road marker, or other location details"
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={busy}
              style={primaryButton}
            >
              {busy ? "Sending..." : "Use My Current Location"}
            </button>

            <button
              type="button"
              onClick={handleManualSubmit}
              disabled={busy}
              style={secondaryButton}
            >
              {busy ? "Sending..." : "Send Manual Report"}
            </button>
          </div>

          {status ? (
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                color: "#111827",
              }}
            >
              {status}
            </div>
          ) : null}

          <div style={{ marginTop: 18 }}>
            <a
              href={`/p/${slug}`}
              style={{
                color: "#111827",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Back to plate page
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 15,
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 700,
  background: "#111827",
  color: "#ffffff",
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 700,
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
};