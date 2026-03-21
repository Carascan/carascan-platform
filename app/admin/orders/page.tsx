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

const ADMIN_TOKEN_STORAGE_KEY = "carascan_admin_token";

function formatMoney(cents?: number | null, currency?: string | null) {
  if (typeof cents !== "number") return "";
  const value = cents / 100;
  return `${value.toFixed(2)} ${String(currency ?? "").toUpperCase()}`.trim();
}

function normaliseIdentifierSearch(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  if (!digits) return "";
  return `CSN-${digits.padStart(6, "0")}`;
}

export default function AdminOrdersPage() {
  const [searchDigits, setSearchDigits] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("");

  const [token, setToken] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [booted, setBooted] = useState(false);

  async function loadOrders(tokenOverride?: string, digitsOverride?: string) {
    const tokenToUse = (tokenOverride ?? token).trim();
    const digitsToUse = (digitsOverride ?? searchDigits).trim();
    const queryValue = normaliseIdentifierSearch(digitsToUse);

    if (!tokenToUse) {
      setMessage("Enter admin password.");
      setRows([]);
      return false;
    }

    setBusy(true);
    setMessage("");

    try {
      const r = await fetch(
        `/api/admin/orders?q=${encodeURIComponent(queryValue)}`,
        {
          headers: {
            "x-admin-secret": tokenToUse,
          },
          cache: "no-store",
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setMessage(j?.error ?? "Failed to load orders.");
        setRows([]);
        return false;
      }

      const items = Array.isArray(j.items) ? j.items : [];
      setRows(items);
      setMessage(
        queryValue
          ? `Loaded ${items.length} order(s) for ${queryValue}.`
          : `Loaded ${items.length} order(s).`
      );

      return true;
    } catch {
      setMessage("Failed to load orders.");
      setRows([]);
      return false;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);

    const tokenFromUrl = (url.searchParams.get("token") ?? "").trim();
    const tokenFromStorage =
      window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)?.trim() ?? "";
    const searchParam = (url.searchParams.get("search") ?? "").trim();

    const initialToken = tokenFromUrl || tokenFromStorage || "";
    const initialDigits = searchParam.replace(/\D/g, "").slice(0, 6);

    if (initialToken) {
      setToken(initialToken);
      setLoginInput(initialToken);
      setIsAuthenticated(true);
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, initialToken);
    }

    if (initialDigits) {
      setSearchDigits(initialDigits);
    }

    if (tokenFromUrl) {
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }

    setBooted(true);

    if (initialToken) {
      void loadOrders(initialToken, initialDigits);
    }
  }, []);

  async function handleLogin() {
    const candidate = loginInput.trim();
    if (!candidate) {
      setMessage("Enter admin password.");
      return;
    }

    const ok = await loadOrders(candidate, searchDigits);
    if (!ok) {
      setIsAuthenticated(false);
      setToken("");
      window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      return;
    }

    setToken(candidate);
    setIsAuthenticated(true);
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, candidate);
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setToken("");
    setLoginInput("");
    setRows([]);
    setMessage("");
    setSearchDigits("");
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
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

  if (!booted) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f8",
          padding: "32px 20px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            Loading admin…
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f8",
          padding: "32px 20px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            }}
          >
            <AdminHeader
              title="Carascan admin login"
              subtitle="Enter the admin password to access orders and manufacturing previews."
            />

            <div style={{ marginTop: 18 }}>
              <label
                style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
              >
                Admin password
              </label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleLogin();
                }}
                placeholder="Enter admin password"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={() => void handleLogin()}
                disabled={busy}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 700,
                  background: "#111827",
                  color: "#fff",
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? "Checking..." : "Login"}
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
        </div>
      </main>
    );
  }

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <AdminHeader
              title="Carascan admin dashboard"
              subtitle="Search orders, inspect plate status, resend setup links, open the customer plate page, and review secure manufacturing SVG files."
            />

            <button
              type="button"
              onClick={handleLogout}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 10,
                padding: "12px 18px",
                fontWeight: 700,
                background: "#fff",
                color: "#111827",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Search identifier
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#fff",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 12px",
                    background: "#f3f4f6",
                    borderRight: "1px solid #d1d5db",
                    fontWeight: 700,
                    color: "#111827",
                    whiteSpace: "nowrap",
                  }}
                >
                  CSN-
                </div>
                <input
                  value={searchDigits}
                  onChange={(e) =>
                    setSearchDigits(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000029"
                  inputMode="numeric"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: 0,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={busy}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 700,
                  background: "#111827",
                  color: "#fff",
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? "Loading..." : "Load orders"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearchDigits("");
                  void loadOrders(token, "");
                }}
                disabled={busy}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontWeight: 700,
                  background: "#fff",
                  color: "#111827",
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.7 : 1,
                }}
              >
                Clear
              </button>
            </div>
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
              ? `/plates/${encodeURIComponent(row.plate.identifier)}/svg?token=${encodeURIComponent(
                  token
                )}`
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

          {!rows.length && !busy && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 24,
                color: "#6b7280",
              }}
            >
              No matching orders found.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}