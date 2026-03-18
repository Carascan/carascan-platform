"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/AdminHeader";

type OrderRow = {
  id: string;
  status: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  amount_total_cents?: number | null;
  currency?: string | null;
  shipping_name?: string | null;
  shipping_line1?: string | null;
  shipping_line2?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postcode?: string | null;
  shipping_country?: string | null;
  created_at?: string | null;
  plate?: {
    id: string;
    identifier?: string | null;
    slug?: string | null;
    status?: string | null;
    sku?: string | null;
  } | null;
};

function formatMoney(cents?: number | null, currency?: string | null) {
  if (typeof cents !== "number") return "";
  const value = cents / 100;
  return `${value.toFixed(2)} ${String(currency ?? "").toUpperCase()}`.trim();
}

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token") ?? "";
    setToken(tokenFromUrl);

    if (tokenFromUrl) {
      void loadOrders(tokenFromUrl, "");
    } else {
      setMessage("Missing token.");
    }
  }, []);

  async function loadOrders(tokenOverride?: string, queryOverride?: string) {
    const tokenToUse = tokenOverride ?? token;
    const queryToUse = queryOverride ?? query;

    if (!tokenToUse.trim()) {
      setMessage("Missing token.");
      setRows([]);
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const r = await fetch(
        `/api/admin/orders?q=${encodeURIComponent(
          queryToUse.trim()
        )}&token=${encodeURIComponent(tokenToUse.trim())}`,
        {
          cache: "no-store",
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setMessage(j?.error ?? "Failed to load orders.");
        setRows([]);
        return;
      }

      setRows(j.items ?? []);
      setMessage(`Loaded ${j.items?.length ?? 0} order(s).`);
    } catch {
      setMessage("Failed to load orders.");
      setRows([]);
    } finally {
      setBusy(false);
    }
  }

  async function resendSetupLink(plateId: string) {
    const ok = window.confirm("Resend setup link for this plate?");
    if (!ok) return;

    try {
      const r = await fetch("/api/admin/resend-setup-link", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": token,
        },
        body: JSON.stringify({ plateId }),
      });

      const j = await r.json();

      if (!r.ok) {
        alert(j?.error ?? "Failed to resend setup link.");
        return;
      }

      alert(
        `Setup link resent.\nIdentifier: ${j.identifier ?? ""}\nEmail: ${j.email ?? ""}`
      );
    } catch {
      alert("Failed to resend setup link.");
    }
  }

  const summary = useMemo(() => {
    const counts = {
      paid: 0,
      pack_generated: 0,
      sent_to_manufacturing: 0,
      active: 0,
      setup_pending: 0,
    };

    for (const row of rows) {
      if (row.status === "paid") counts.paid += 1;
      if (row.status === "pack_generated") counts.pack_generated += 1;
      if (row.status === "sent_to_manufacturing") counts.sent_to_manufacturing += 1;
      if (row.plate?.status === "active") counts.active += 1;
      if (row.plate?.status === "setup_pending") counts.setup_pending += 1;
    }

    return counts;
  }, [rows]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f8",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            marginBottom: 20,
          }}
        >
          <AdminHeader
            title="Carascan admin dashboard"
            subtitle="Search orders, inspect plate status, resend setup links, open the customer plate page, and review manufacturing SVG files."
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Identifier, slug, plate ID, Stripe session, shipping name..."
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
              onClick={() => loadOrders()}
              disabled={busy || !token.trim()}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "12px 18px",
                fontWeight: 700,
                background: "#111827",
                color: "#fff",
                cursor: busy ? "default" : "pointer",
                opacity: busy || !token.trim() ? 0.7 : 1,
              }}
            >
              {busy ? "Loading..." : "Load orders"}
            </button>
          </div>

          {message && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 10,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              {message}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            ["Paid", summary.paid],
            ["Pack generated", summary.pack_generated],
            ["Sent to manufacturing", summary.sent_to_manufacturing],
            ["Setup pending", summary.setup_pending],
            ["Active", summary.active],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {rows.map((row) => {
            const publicUrl = row.plate?.slug
              ? `/p/${encodeURIComponent(row.plate.slug)}`
              : null;

            const svgPreviewUrl = row.plate?.identifier
              ? `/plates/${encodeURIComponent(row.plate.identifier)}/svg`
              : null;

            return (
              <div
                key={row.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 18,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr auto",
                    gap: 16,
                    alignItems: "start",
                  }}
                >
                  <div style={{ display: "grid", gap: 8 }}>
                    <div>
                      <strong>Identifier:</strong>{" "}
                      {svgPreviewUrl ? (
                        <a
                          href={svgPreviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#111827",
                            fontWeight: 700,
                            textDecoration: "underline",
                          }}
                        >
                          {row.plate?.identifier ?? "—"}
                        </a>
                      ) : (
                        row.plate?.identifier ?? "—"
                      )}
                    </div>
                    <div><strong>Plate ID:</strong> {row.plate?.id ?? "—"}</div>
                    <div><strong>Slug:</strong> {row.plate?.slug ?? "—"}</div>
                    <div><strong>Order status:</strong> {row.status ?? "—"}</div>
                    <div><strong>Plate status:</strong> {row.plate?.status ?? "—"}</div>
                    <div><strong>Shipping name:</strong> {row.shipping_name ?? "—"}</div>
                    <div><strong>Amount:</strong> {formatMoney(row.amount_total_cents, row.currency) || "—"}</div>
                    <div><strong>Stripe session:</strong> {row.stripe_checkout_session_id ?? "—"}</div>
                    <div><strong>Created:</strong> {row.created_at ?? "—"}</div>
                  </div>

                  <div style={{ display: "grid", gap: 8 }}>
                    <div><strong>Ship to</strong></div>
                    <div>{row.shipping_line1 ?? ""}</div>
                    {row.shipping_line2 ? <div>{row.shipping_line2}</div> : null}
                    <div>
                      {[row.shipping_city, row.shipping_state, row.shipping_postcode]
                        .filter(Boolean)
                        .join(" ")}
                    </div>
                    <div>{row.shipping_country ?? ""}</div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => row.plate?.id && resendSetupLink(row.plate.id)}
                      disabled={!row.plate?.id}
                      style={{
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontWeight: 700,
                        background: "#111827",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Resend setup link
                    </button>

                    {publicUrl ? (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          textAlign: "center",
                          textDecoration: "none",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontWeight: 700,
                          background: "#e5e7eb",
                          color: "#111827",
                        }}
                      >
                        Open customer page
                      </a>
                    ) : null}

                    {svgPreviewUrl ? (
                      <a
                        href={svgPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-block",
                          textAlign: "center",
                          textDecoration: "none",
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontWeight: 700,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                        }}
                      >
                        Open SVG preview
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

          {!rows.length && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 24,
                color: "#6b7280",
              }}
            >
              No orders loaded yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}