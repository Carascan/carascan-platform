"use client";

import { useState } from "react";

type ContactClientProps = {
  slug: string;
  allowContactOwner: boolean;
  allowEmergency: boolean;
};

type Mode = "contact" | "emergency" | "location_only";

export default function ContactClient({
  slug,
  allowContactOwner,
  allowEmergency,
}: ContactClientProps) {
  const [mode, setMode] = useState<Mode>(
    allowContactOwner ? "contact" : "emergency"
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);
  const [locationOnlyConfirm, setLocationOnlyConfirm] = useState(false);
  const [sentTime, setSentTime] = useState<string | null>(null);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setStatus("");
    setSentTime(null);
    setEmergencyConfirm(false);
    setLocationOnlyConfirm(false);
  };

  async function getDeviceLocation() {
    if (!navigator.geolocation) return null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 0,
        })
      );

      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy_m: pos.coords.accuracy,
        location_source: "device",
      };
    } catch {
      return null;
    }
  }

  const send = async () => {
    setStatus("");

    if (mode === "contact" && !msg.trim()) {
      setStatus("Please enter a message.");
      return;
    }

    if (mode === "contact" && !allowContactOwner) {
      setStatus("Owner contact is not enabled for this plate.");
      return;
    }

    if (mode === "emergency" && !allowEmergency) {
      setStatus("Emergency alerts are not enabled for this plate.");
      return;
    }

    if (mode === "emergency" && !emergencyConfirm) {
      setEmergencyConfirm(true);
      return;
    }

    if (mode === "location_only" && !locationOnlyConfirm) {
      setLocationOnlyConfirm(true);
      return;
    }

    try {
      setSending(true);

      if (mode === "contact") {
        setStatus("Sending...");

        const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/contact`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reporter_name: name.trim() || null,
            reporter_phone: phone.trim() || null,
            reporter_email: email.trim() || null,
            message: msg.trim(),
          }),
        });

        const j = await r.json().catch(() => null);

        if (!r.ok) {
          setStatus(j?.error ?? "Failed.");
          return;
        }

        const now = new Date().toLocaleTimeString();
        setSentTime(now);
        setStatus(`Message sent at ${now}`);
        setMsg("");
        return;
      }

      setStatus("Requesting location permission...");

      const deviceLocation = await getDeviceLocation();

      if (!deviceLocation) {
        setStatus("Location permission denied or unavailable.");
        return;
      }

      setStatus("Sending...");

      const endpoint =
        mode === "emergency"
          ? `/api/plates/${encodeURIComponent(slug)}/emergency`
          : `/api/plates/${encodeURIComponent(slug)}/report-location`;

      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reporter_name: name.trim() || null,
          reporter_phone: phone.trim() || null,
          reporter_email: email.trim() || null,
          message:
            mode === "location_only"
              ? "Location reported"
              : msg.trim() || null,
          latitude: deviceLocation.latitude,
          longitude: deviceLocation.longitude,
          accuracy_m: deviceLocation.accuracy_m,
          location_source: deviceLocation.location_source,
        }),
      });

      const j = await r.json().catch(() => null);

      if (!r.ok) {
        setStatus(j?.error ?? "Failed.");
        return;
      }

      const now = new Date().toLocaleTimeString();
      setSentTime(now);

      if (mode === "emergency") {
        setStatus(`Emergency alert sent at ${now}`);
      } else {
        setStatus(`Location reported at ${now}`);
      }

      setMsg("");
      setEmergencyConfirm(false);
      setLocationOnlyConfirm(false);
    } catch {
      setStatus("Failed.");
    } finally {
      setSending(false);
    }
  };

  if (!allowContactOwner && !allowEmergency) {
    return (
      <main>
        <h1>Contact</h1>
        <div className="card">
          <b>This plate is not currently accepting contact or emergency alerts.</b>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>
        {mode === "contact"
          ? "Contact owner"
          : mode === "emergency"
          ? "Emergency alert"
          : "Report location"}
      </h1>

      {status && (
        <div className="card">
          <b>{status}</b>
        </div>
      )}

      {(mode === "emergency" || mode === "location_only" || mode === "contact") &&
        sentTime && (
          <div className="card" style={{ background: "#fff7ed" }}>
            <b>
              {mode === "contact"
                ? `Message sent at ${sentTime}`
                : mode === "emergency"
                ? `Emergency alert sent at ${sentTime}`
                : `Location reported at ${sentTime}`}
            </b>
          </div>
        )}

      <div className="card">
        <div className="grid grid2" style={{ marginBottom: 12 }}>
          {allowContactOwner && (
            <button
              type="button"
              className="btn"
              onClick={() => switchMode("contact")}
              disabled={sending}
            >
              Contact owner
            </button>
          )}

          {allowEmergency && (
            <button
              type="button"
              className="btn"
              onClick={() => switchMode("emergency")}
              disabled={sending}
            >
              Emergency
            </button>
          )}

          <button
            type="button"
            className="btn"
            onClick={() => switchMode("location_only")}
            disabled={sending}
          >
            Report location
          </button>
        </div>

        {mode === "emergency" && (
          <div
            className="card"
            style={{
              marginBottom: 14,
              background: emergencyConfirm ? "#fff7ed" : "#f9fafb",
            }}
          >
            <b>
              {emergencyConfirm
                ? "Confirm emergency alert"
                : "Emergency alerts notify the owner and emergency contacts."}
            </b>

            <div style={{ marginTop: 6 }}>
              {emergencyConfirm
                ? "Press the button again to send the alert."
                : "Use this only for urgent situations."}
            </div>

            <div style={{ marginTop: 12 }}>
              <a
                href="tel:000"
                style={{
                  display: "inline-block",
                  background: "#dc2626",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Call Emergency Services (000)
              </a>
            </div>
          </div>
        )}

        {mode === "location_only" && (
          <div
            className="card"
            style={{
              marginBottom: 14,
              background: locationOnlyConfirm ? "#eff6ff" : "#f9fafb",
            }}
          >
            <b>
              {locationOnlyConfirm
                ? "Confirm location report"
                : "Report this item's current location to the owner."}
            </b>

            <div style={{ marginTop: 6 }}>
              {locationOnlyConfirm
                ? "Press again to send the location report."
                : "Your device will ask for location permission when sending."}
            </div>
          </div>
        )}

        <label>Your name (optional)</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <div className="grid grid2">
          <div>
            <label>Your phone (optional)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div>
            <label>Your email (optional)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        {mode !== "location_only" && (
          <>
            <label>
              {mode === "contact" ? "Message to owner" : "Emergency details"}
            </label>

            <textarea
              rows={5}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </>
        )}

        <button className="btn" onClick={send} disabled={sending}>
          {sending
            ? "Sending..."
            : mode === "contact"
            ? "Send message"
            : mode === "emergency"
            ? emergencyConfirm
              ? "Send emergency alert"
              : "Continue"
            : locationOnlyConfirm
            ? "Send location report"
            : "Continue"}
        </button>
      </div>

      <small>
        {mode === "contact"
          ? "Owner contact details are never shown publicly."
          : mode === "emergency"
          ? "Emergency alerts are sent to the owner and enabled emergency contacts."
          : "Location reporting sends your device GPS location to the owner."}
      </small>
    </main>
  );
}