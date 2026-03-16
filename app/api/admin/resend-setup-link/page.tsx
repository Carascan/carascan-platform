"use client";

import { useState } from "react";

export default function ResendSetupLinkAdminPage() {
  const [plateId, setPlateId] = useState("");
  const [email, setEmail] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function submit() {
    setBusy(true);
    setResult("");

    try {
      const r = await fetch("/api/admin/resend-setup-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          plateId: plateId.trim(),
          email: email.trim() || undefined,
        }),
      });

      const j = await r.json();

      if (!r.ok) {
        setResult(j?.error ?? "Request failed.");
        return;
      }

      setResult(
        `Setup link resent successfully.\nIdentifier: ${j.identifier ?? ""}\nEmail: ${j.email ?? ""}`,
      );
    } catch {
      setResult("Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f8",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Admin: Resend setup link</h1>

        <p style={{ color: "#4b5563" }}>
          Send a fresh Carascan setup link for an existing plate.
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Plate ID
            </label>
            <input
              value={plateId}
              onChange={(e) => setPlateId(e.target.value)}
              placeholder="e776699b-3dce-4dab-9916-3600b207e039"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Override email (optional)
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <div>
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
            onClick={submit}
            disabled={busy || !plateId.trim() || !adminSecret.trim()}
            style={{
              border: 0,
              borderRadius: 10,
              padding: "14px 16px",
              fontWeight: 700,
              background: "#111827",
              color: "#fff",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Sending..." : "Resend setup link"}
          </button>

          {result && (
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 14,
              }}
            >
              {result}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}