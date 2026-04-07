"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const HERO_IMAGE_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

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
    <>
      <NavBar variant="inner" />

      <main
        style={{
          minHeight: "calc(100vh - 78px)",
          position: "relative",
          overflow: "hidden",
          background: "#E7E2D8",
          padding: "40px 20px 72px",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <img
            src={HERO_IMAGE_URL}
            alt="Caravan travelling along the Australian coastline"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 58%",
              display: "block",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(231,226,216,0.88) 0%, rgba(231,226,216,0.72) 35%, rgba(231,226,216,0.42) 60%, rgba(231,226,216,0.62) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 760,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
              background: "rgba(255,253,249,0.94)",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <img
              src={LOGO_URL}
              alt="Carascan"
              style={{
                width: "100%",
                maxWidth: 360,
                height: "auto",
                display: "block",
                margin: "0 auto 18px",
              }}
            />

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "clamp(32px, 5vw, 44px)",
                lineHeight: 1.08,
                color: "#1F2933",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Buy Carascan Plate
            </h1>

            <p
              style={{
                margin: 0,
                color: "#5F5A54",
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              Smart QR plate for caravans and vehicles
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,253,249,0.94)",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 24,
              marginBottom: 20,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1F2933",
                marginBottom: 8,
              }}
            >
              90x90mm Carascan Anodised Aluminium Plate with unique QR code
            </div>

            <div
              style={{
                color: "#5F5A54",
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
            <input type="hidden" name="mounting_method" value="adhesive" />

            <div
              style={{
                border: "1px solid #D4CEC4",
                borderRadius: 18,
                padding: 24,
                marginBottom: 22,
                background: "rgba(255,253,249,0.94)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
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
                      color: "#1F2933",
                    }}
                  >
                    Emergency contact subscription
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: "#5F5A54",
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
                    border: "1px solid #D4CEC4",
                    borderRadius: 12,
                    padding: "8px 12px",
                    background: "rgba(255,253,249,0.92)",
                    color: "#1F2933",
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
                    borderRadius: 14,
                    background: "#F3F1EC",
                    border: "1px solid #D4CEC4",
                    color: "#5F5A54",
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
                border: "1px solid #D4CEC4",
                borderRadius: 18,
                padding: 24,
                marginBottom: 22,
                background: "rgba(255,253,249,0.94)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1F2933",
                  marginBottom: 14,
                }}
              >
                Pricing summary
              </div>

              <div style={{ display: "grid", gap: 10, color: "#5F5A54" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span>
                    90x90mm Weatherproof anodised aluminium Carascan plate with
                    laser engraved customer unique QR code
                  </span>
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
                    borderTop: "1px solid #D4CEC4",
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
    </>
  );
}