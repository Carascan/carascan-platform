"use client";

import { useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function Buy() {
  const [emergencyPlan, setEmergencyPlan] = useState<"3" | "10">("3");
  const [showIncludedInfo, setShowIncludedInfo] = useState(false);

  const platePrice = 35;
  const standardSubscription = 2;
  const upgradeSubscription = 4;
  const subscriptionPrice =
    emergencyPlan === "10" ? upgradeSubscription : standardSubscription;
  const upgradeDelta = upgradeSubscription - standardSubscription;
  const totalToday = platePrice + subscriptionPrice;

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
            <div>• Industrial adhesive mounting (recommended standard)</div>
          </div>
        </div>

        <form action="/api/checkout/create" method="post">
          {/* Hidden default mounting method (system standard) */}
          <input type="hidden" name="mounting_method" value="adhesive" />

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
                marginBottom: 12,
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
                  Emergency contact subscription
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: "#6b7280",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Choose your contact capacity
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
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  color: "#4b5563",
                  lineHeight: 1.6,
                }}
              >
                The standard Carascan subscription supports up to 3 ICE
                contacts and is billed monthly.
                <br />
                If you would like more than 3 emergency contacts, up to 10 ICE
                contacts can be purchased and billed monthly.
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              <label
                style={{
                  display: "block",
                  border:
                    emergencyPlan === "3"
                      ? "2px solid #111827"
                      : "1px solid #d1d5db",
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                  background: emergencyPlan === "3" ? "#f9fafb" : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="emergency_plan"
                  value="3"
                  checked={emergencyPlan === "3"}
                  onChange={() => setEmergencyPlan("3")}
                  style={{ marginRight: 10 }}
                />
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  3 x ICE contacts
                </span>
                <div
                  style={{
                    marginTop: 6,
                    marginLeft: 24,
                    color: "#4b5563",
                    lineHeight: 1.5,
                  }}
                >
                  Standard monthly subscription for up to 3 ICE contacts.
                </div>
                <div
                  style={{
                    marginTop: 8,
                    marginLeft: 24,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  $2.00 / month ($48 per year unless cancelled)
                </div>
              </label>

              <label
                style={{
                  display: "block",
                  border:
                    emergencyPlan === "10"
                      ? "2px solid #111827"
                      : "1px solid #d1d5db",
                  borderRadius: 14,
                  padding: 16,
                  cursor: "pointer",
                  background: emergencyPlan === "10" ? "#f9fafb" : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="emergency_plan"
                  value="10"
                  checked={emergencyPlan === "10"}
                  onChange={() => setEmergencyPlan("10")}
                  style={{ marginRight: 10 }}
                />
                <span style={{ fontWeight: 700, color: "#111827" }}>
                  10 x ICE contacts
                </span>
                <div
                  style={{
                    marginTop: 6,
                    marginLeft: 24,
                    color: "#4b5563",
                    lineHeight: 1.5,
                  }}
                >
                  Expanded monthly subscription for up to 10 ICE contacts.
                </div>

                {emergencyPlan === "10" && (
                  <div
                    style={{
                      marginTop: 8,
                      marginLeft: 24,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    $4.00 / month ($48 per year unless cancelled)
                  </div>
                )}
              </label>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 22,
              marginBottom: 22,
              background: "#f9fafb",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 14,
              }}
            >
              Pricing summary
            </div>

            <div style={{ display: "grid", gap: 10, color: "#374151" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <span>90x90mm Weatherproof anodised aluminium Carascan plate with laser engraved customer unique QR code</span>
                <strong>$35.00</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <span>
                  {emergencyPlan === "10"
                    ? "10 x ICE contact subscription"
                    : "3 x ICE contact subscription"}
                </span>
                <strong>${subscriptionPrice}.00 / month</strong>
              </div>

              {emergencyPlan === "10" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    color: "#6b7280",
                    fontSize: 14,
                  }}
                >
                  <span>Upgrade above standard 3-contact subscription</span>
                  <strong>+${upgradeDelta}.00 / month</strong>
                </div>
              )}

              <div
                style={{
                  marginTop: 8,
                  paddingTop: 12,
                  borderTop: "1px solid #d1d5db",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  color: "#111827",
                  fontSize: 18,
                }}
              >
                <span>
                  Total today
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#6b7280",
                      marginTop: 4,
                    }}
                  >
                    Includes plate + first month of selected subscription
                  </div>
                </span>
                <strong>${totalToday}.00</strong>
              </div>
            </div>
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