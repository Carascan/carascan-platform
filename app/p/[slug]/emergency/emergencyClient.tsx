"use client";

import { useState } from "react";

type Props = {
  slug: string;
};

export default function EmergencyClient({ slug }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sentTime, setSentTime] = useState<string | null>(null);

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

    if (!confirm) {
      setConfirm(true);
      return;
    }

    try {
      setSending(true);
      setStatus("Requesting location permission...");

      const location = await getDeviceLocation();

      if (!location) {
        setStatus("Location permission denied or unavailable.");
        return;
      }

      setStatus("Sending emergency alert...");

      const r = await fetch(
        `/api/plates/${encodeURIComponent(slug)}/emergency`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            reporter_name: name.trim() || null,
            reporter_phone: phone.trim() || null,
            reporter_email: email.trim() || null,
            message: msg.trim() || null,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy_m: location.accuracy_m,
            location_source: location.location_source,
          }),
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setStatus(j?.error ?? "Failed.");
        return;
      }

      const now = new Date().toLocaleTimeString();
      setSentTime(now);
      setStatus(`Emergency alert sent at ${now}`);
      setMsg("");
      setConfirm(false);
    } catch {
      setStatus("Failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main>
      <h1>Emergency alert</h1>

      {status && (
        <div className="card">
          <b>{status}</b>
        </div>
      )}

      {sentTime && (
        <div className="card" style={{ background: "#fff7ed" }}>
          <b>Emergency alert sent at {sentTime}</b>
        </div>
      )}

      <div className="card">
        <div
          className="card"
          style={{
            marginBottom: 14,
            background: confirm ? "#fff7ed" : "#f9fafb",
          }}
        >
          <b>
            {confirm
              ? "Confirm emergency alert"
              : "Emergency alerts notify the owner and emergency contacts."}
          </b>

          <div style={{ marginTop: 6 }}>
            {confirm
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

        <label>Emergency details</label>
        <textarea
          rows={5}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        <button className="btn" onClick={send} disabled={sending}>
          {sending
            ? "Sending..."
            : confirm
            ? "Send emergency alert"
            : "Continue"}
        </button>
      </div>

      <small>
        Emergency alerts are sent to the owner and enabled emergency contacts.
      </small>
    </main>
  );
}