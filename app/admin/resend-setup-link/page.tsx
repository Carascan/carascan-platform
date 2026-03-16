"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";

export default function ResendSetupPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [plateId, setPlateId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function resend() {
    if (!plateId.trim()) {
      setMessage("Please enter a plate ID.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const r = await fetch("/api/admin/resend-setup-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ plateId: plateId.trim() }),
      });

      const j = await r.json();

      if (!r.ok) {
        setMessage(j?.error ?? "Failed to resend setup link.");
        return;
      }

      setMessage(
        `Setup link resent to ${j.email ?? "customer"} (identifier ${j.identifier ?? ""}).`,
      );
    } catch {
      setMessage("Failed to resend setup link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background: "#f7f7f8",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <AdminHeader
            title="Resend setup link"
            subtitle="Manually resend the customer setup link using a plate ID."
          />

          {message && (
            <div
              style={{
                marginBottom: 18,
                padding: "14px 16px",
                borderRadius: 12,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <strong>{message}</strong>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Plate ID
            </label>

            <input
              value={plateId}
              onChange={(e) => setPlateId(e.target.value)}
              placeholder="Enter plate UUID"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Admin secret
            </label>

            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter admin secret"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <button
            type="button"
            onClick={resend}
            disabled={busy || !adminSecret.trim()}
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 17,
              fontWeight: 600,
              background: "#111827",
              color: "#ffffff",
              cursor: busy ? "default" : "pointer",
              opacity: busy || !adminSecret.trim() ? 0.7 : 1,
            }}
          >
            {busy ? "Sending..." : "Resend setup link"}
          </button>
        </div>
      </div>
    </main>
  );
}