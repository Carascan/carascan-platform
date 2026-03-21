"use client";

import { useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function Buy() {
  const [mountingMethod, setMountingMethod] = useState<"rivet" | "adhesive">(
    "rivet"
  );
  const [showMountingInfo, setShowMountingInfo] = useState(false);
  const [showIncludedInfo, setShowIncludedInfo] = useState(false);
  const [showUpgradeInfo, setShowUpgradeInfo] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src={LOGO_URL}
            alt="Carascan"
            style={{
              width: "100%",
              maxWidth: 360,
              height: "auto",
              display: "block",
              margin: "0 auto 20px",
            }}
          />

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 32,
              lineHeight: 1.1,
            }}
          >
            Buy Carascan Plate
          </h1>

          <p
            style={{
              margin: 0,
              color: "#4b5563",
              fontSize: 16,
            }}
          >
            Smart QR plate for caravans and vehicles
          </p>
        </div>

        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 22,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            90x90mm Carascan Anodised Aluminium Plate with unique QR code
          </div>

          <div
            style={{
              color: "#374151",
              lineHeight: 1.7,
              display: "grid",
              gap: 4,
            }}
          >
            <div>• 90 x 90mm anodised aluminium plate</div>
            <div>• Unique Carascan QR code</div>
            <div>• Laser engraved for durable outdoor use</div>
            <div>• Customer contact personalisation completed after purchase</div>
          </div>
        </div>

        <form action="/api/checkout/create" method="post">
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 22,
              marginBottom: 18,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  Select mounting method
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#6b7280",
                    fontSize: 14,
                  }}
                >
                  Required
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMountingInfo((v) => !v)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {showMountingInfo ? "Hide details" : "Show details"}
              </button>
            </div>

            {showMountingInfo && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#4b5563",
                  lineHeight: 1.6,
                }}
              >
                Choose how the plate will be fitted.
                <br />
                Rivet mounting supplies the plate with mounting holes for pop
                rivets.
                <br />
                Adhesive mounting supplies the plate without holes for adhesive
                fixing.
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              <label
                style={{
                  display: "block",
                  border:
                    mountingMethod === "rivet"
                      ? "2px solid #111827"
                      : "1px solid #d1d5db",
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                  background:
                    mountingMethod === "rivet" ? "#f9fafb" : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="mounting_method"
                  value="rivet"
                  checked={mountingMethod === "rivet"}
                  onChange={() => setMountingMethod("rivet")}
                  style={{ marginRight: 10 }}
                />
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  Rivet mounting
                </span>
                <div
                  style={{
                    marginTop: 6,
                    marginLeft: 24,
                    color: "#4b5563",
                    lineHeight: 1.5,
                  }}
                >
                  Plate supplied with mounting holes for pop rivets.
                </div>
              </label>

              <label
                style={{
                  display: "block",
                  border:
                    mountingMethod === "adhesive"
                      ? "2px solid #111827"
                      : "1px solid #d1d5db",
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                  background:
                    mountingMethod === "adhesive" ? "#f9fafb" : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="mounting_method"
                  value="adhesive"
                  checked={mountingMethod === "adhesive"}
                  onChange={() => setMountingMethod("adhesive")}
                  style={{ marginRight: 10 }}
                />
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  Adhesive mounting
                </span>
                <div
                  style={{
                    marginTop: 6,
                    marginLeft: 24,
                    color: "#4b5563",
                    lineHeight: 1.5,
                  }}
                >
                  Plate supplied without holes for adhesive fixing.
                </div>
              </label>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 22,
              marginBottom: 14,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  3 x Emergency contact subscription
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#16a34a",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Included with purchase
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIncludedInfo((v) => !v)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {showIncludedInfo ? "Hide details" : "Show details"}
              </button>
            </div>

            {showIncludedInfo && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#4b5563",
                  lineHeight: 1.6,
                }}
              >
                Your Carascan purchase includes support for up to 3 emergency
                contacts. This is part of the included subscription and does not
                need to be selected separately during checkout.
              </div>
            )}
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 22,
              marginBottom: 22,
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  10 x Emergency contact upgrade subscription
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Expansion ready for future release
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUpgradeInfo((v) => !v)}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "8px 12px",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {showUpgradeInfo ? "Hide details" : "Show details"}
              </button>
            </div>

            {showUpgradeInfo && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#4b5563",
                  lineHeight: 1.6,
                }}
              >
                This section is being kept ready for future subscription
                expansion. It is not currently a separate live purchase option,
                but the buy page structure is prepared so additional tiers can be
                added cleanly later.
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "16px 20px",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              background: "#111827",
              color: "#ffffff",
            }}
          >
            Checkout
          </button>
        </form>

        <p
          style={{
            marginTop: 14,
            textAlign: "center",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          Payment handled securely by Stripe Checkout
        </p>
      </div>
    </main>
  );
}