"use client";

import { useState } from "react";

type ContactClientProps = {
  slug: string;
  allowContactOwner: boolean;
  allowEmergency: boolean;
};

type Mode = "contact" | "emergency";

type LocationPayload = {
  lat: number;
  lng: number;
  accuracy?: number | null;
} | null;

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

  async function getLocation(): Promise<LocationPayload> {
    if (!navigator.geolocation) return null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
        })
      );

      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch {
      return null;
    }
  }

  const send = async () => {
    setStatus("");

    if (!msg.trim()) {
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

    try {
      setSending(true);

      const location = await getLocation();

      const r = await fetch(`/api/plates/${encodeURIComponent(slug)}/contact`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: mode,
          reporter_name: name.trim() || null,
          reporter_phone: phone.trim() || null,
          reporter_email: email.trim() || null,
          message: msg.trim(),
          location,
        }),
      });

      const j = await r.json();

      if (!r.ok) {
        setStatus(j?.error ?? "Failed.");
        return;
      }

      setStatus(
        mode === "contact"
          ? "Sent. The owner has been notified."
          : "Emergency alert sent."
      );

      setMsg("");
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
      <h1>{mode === "contact" ? "Contact owner" : "Emergency alert"}</h1>

      {status && (
        <div className="card">
          <b>{status}</b>
        </div>
      )}

      <div className="card">
        {(allowContactOwner || allowEmergency) && (
          <div className="grid grid2" style={{ marginBottom: 12 }}>
            {allowContactOwner && (
              <button
                type="button"
                className={`btn ${mode === "contact" ? "active" : ""}`}
                onClick={() => setMode("contact")}
                disabled={sending}
              >
                Contact owner
              </button>
            )}

            {allowEmergency && (
              <button
                type="button"
                className={`btn ${mode === "emergency" ? "active" : ""}`}
                onClick={() => setMode("emergency")}
                disabled={sending}
              >
                Emergency
              </button>
            )}
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

        <label>
          {mode === "contact" ? "Message to owner" : "Emergency details"}
        </label>
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          rows={5}
        />

        <button className="btn" type="button" onClick={send} disabled={sending}>
          {sending
            ? "Sending..."
            : mode === "contact"
            ? "Send"
            : "Send emergency alert"}
        </button>
      </div>

      <small>
        {mode === "contact"
          ? "No owner contact details are shown. This relays a message to the owner only."
          : "This sends an emergency alert according to the owner's selected notification settings."}
      </small>
    </main>
  );
}