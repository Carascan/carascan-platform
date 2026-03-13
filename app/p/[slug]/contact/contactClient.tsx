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
  const [emergencyConfirm, setEmergencyConfirm] = useState(false);

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

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setStatus("");
    if (nextMode !== "emergency") {
      setEmergencyConfirm(false);
    }
  };

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

    if (mode === "emergency" && !emergencyConfirm) {
      setEmergencyConfirm(true);
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
      setEmergencyConfirm(false);
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
        </div>

        {mode === "emergency" && (
          <div className="card" style={{ marginBottom: 12 }}>
            <b>
              {emergencyConfirm
                ? "Confirm emergency alert"
                : "Emergency alerts notify the owner and emergency contacts."}
            </b>
            <div style={{ marginTop: 6 }}>
              {emergencyConfirm
                ? "Press again to send the emergency alert."
                : "Use this only for urgent situations."}
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

        <label>
          {mode === "contact" ? "Message to owner" : "Emergency details"}
        </label>

        <textarea
          rows={5}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />

        <button className="btn" onClick={send} disabled={sending}>
          {sending
            ? "Sending..."
            : mode === "contact"
            ? "Send"
            : emergencyConfirm
            ? "Send emergency alert now"
            : "Continue emergency alert"}
        </button>
      </div>
    </main>
  );
}
