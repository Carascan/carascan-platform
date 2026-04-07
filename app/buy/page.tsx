"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";

const HERO_IMAGE_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

export default function Buy() {
  const [emergencyPlan, setEmergencyPlan] = useState<"3" | "10">("3");
  const [shippingOption, setShippingOption] = useState<"standard" | "express">(
    "standard"
  );

  const platePrice = 35;
  const standardSubscription = 3;
  const upgradeSubscription = 5;
  const standardShipping = 10;
  const expressShipping = 15;

  const subscriptionPrice =
    emergencyPlan === "10" ? upgradeSubscription : standardSubscription;

  const shippingPrice =
    shippingOption === "express" ? expressShipping : standardShipping;

  const totalToday = platePrice + subscriptionPrice + shippingPrice;

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
              marginBottom: 20,
              background: "rgba(255,253,249,0.94)",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#C96A2B",
              }}
            >
              Smart QR plates for caravans
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(26px, 4.2vw, 36px)",
                lineHeight: 1.15,
                color: "#1F2933",
                maxWidth: 760,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              Purchase your unique Carascan plate for your caravan, camp trailer or mobile home.
              
              Be part of our growing community, keeping each other safe.
            </h1>
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
                marginBottom: 10,
                lineHeight: 1.4,
              }}
            >
              Step 1. Your unique QR coded plate
            </div>

            <div
              style={{
                marginTop: 10,
                marginBottom: 14,
                color: "#5F5A54",
                lineHeight: 1.5,
                fontWeight: 500,
                fontSize: 15,
                maxWidth: 520,
              }}
            >
              You will receive a Carascan Aluminium Plate with unique QR code.
            </div>

            <div
              style={{
                color: "#5F5A54",
                lineHeight: 1.7,
                display: "grid",
                gap: 6,
                fontSize: 15,
              }}
            >
              <div>• 90 x 90mm aluminium plate, 2mm thickness</div>
              <div>
                • Unique Carascan QR code for your personal public page access
              </div>
              <div>• Laser engraved for durable outdoor use</div>
              <div>
                • Powdercoated in a clear finish for a long life in the elements
              </div>
              <div>
                • Customer contact personalisation required after purchase is
                finalised
              </div>
              <div>
                • Industrial adhesive as standard mounting method (sold
                separately)
              </div>
            </div>
          </div>

          <form action="/api/checkout/create" method="post">
            <input type="hidden" name="mounting_method" value="adhesive" />
            <input
              type="hidden"
              name="shipping_option"
              value={shippingOption}
            />

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
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1F2933",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                Step 2. Choose how many emergency contacts
              </div>

              <div
                style={{
                  marginTop: 6,
                  marginBottom: 16,
                  color: "#5F5A54",
                  lineHeight: 1.5,
                  fontWeight: 500,
                  fontSize: 15,
                  maxWidth: 520,
                }}
              >
                Select the subsription option that works for you.
              </div>

              <div
                style={{
                  color: "#5F5A54",
                  lineHeight: 1.7,
                  display: "grid",
                  gap: 6,
                  fontSize: 15,
                }}
              >
                <div>• "Virtual Doorknock" - included in all subsriptions</div>
                <div>• Report Location - included in all subsriptions</div>
                <div>
                  • Customer preferences for contact are always controlled by
                  you
                </div>
                <div>
                  • Add up to three emergency contacts who will be alerted by
                  SMS and Email in an emergecny
                </div>
                <div>
                  • Need more people aware? Choose up the option for up to 10
                  emergency contacts.
                </div>
                <div>
                  • Emergency contacts are always sent and email and SMS so your
                  loved ones are informed
                </div>
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    border: "1px solid #D4CEC4",
                    borderRadius: 16,
                    padding: 16,
                    cursor: "pointer",
                    background: "rgba(255,253,249,0.92)",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      minWidth: 20,
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 3,
                    }}
                  >
                    <input
                      type="radio"
                      name="emergency_plan"
                      value="3"
                      checked={emergencyPlan === "3"}
                      onChange={() => setEmergencyPlan("3")}
                      required
                      style={{
                        margin: 0,
                        width: 14,
                        height: 14,
                        flex: "0 0 auto",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1F2933" }}>
                      3 x Emergency contacts
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "#5F5A54",
                        lineHeight: 1.5,
                      }}
                    >
                      Standard monthly subscription for up to three (3)
                      emergency contacts (1 x email and phone number per
                      contact)
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        color: "#1F2933",
                      }}
                    >
                      $3.00 / month ($36 per year unless cancelled)
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    border: "1px solid #D4CEC4",
                    borderRadius: 16,
                    padding: 16,
                    cursor: "pointer",
                    background: "rgba(255,253,249,0.92)",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      minWidth: 20,
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 3,
                    }}
                  >
                    <input
                      type="radio"
                      name="emergency_plan"
                      value="10"
                      checked={emergencyPlan === "10"}
                      onChange={() => setEmergencyPlan("10")}
                      required
                      style={{
                        margin: 0,
                        width: 14,
                        height: 14,
                        flex: "0 0 auto",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1F2933" }}>
                      10 x Emergency Contacts
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "#5F5A54",
                        lineHeight: 1.5,
                      }}
                    >
                      Premium monthly subscription for up to ten (10) emergency
                      contacts (1 x email and phone number per contact)
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        color: "#1F2933",
                      }}
                    >
                      $5.00 / month ($60 per year unless cancelled)
                    </div>
                  </div>
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
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1F2933",
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                Step 3. Choose your shipping option
              </div>

              <div
                style={{
                  marginTop: 6,
                  marginBottom: 16,
                  color: "#5F5A54",
                  lineHeight: 1.5,
                  fontWeight: 500,
                  fontSize: 15,
                  maxWidth: 520,
                }}
              >
                Send the plate on a journey to your house. Pick what pace it travels at.
              </div>

              <div
                style={{
                  color: "#5F5A54",
                  lineHeight: 1.7,
                  display: "grid",
                  gap: 6,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                <div>
                  • Standard shipping is a flat $10.00 - Anywhere in Australia
                </div>
                <div>
                  • Express shipping is a flat $15.00 - Anywhere in Australia
                </div>
                <div>• Contact us for any specific shipping options</div>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    border: "1px solid #D4CEC4",
                    borderRadius: 16,
                    padding: 16,
                    cursor: "pointer",
                    background: "rgba(255,253,249,0.92)",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      minWidth: 20,
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 3,
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping_choice"
                      value="standard"
                      checked={shippingOption === "standard"}
                      onChange={() => setShippingOption("standard")}
                      required
                      style={{
                        margin: 0,
                        width: 14,
                        height: 14,
                        flex: "0 0 auto",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1F2933" }}>
                      Standard Shipping
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "#5F5A54",
                        lineHeight: 1.5,
                      }}
                    >
                      Standard delivery option for your Carascan plate.
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        color: "#1F2933",
                      }}
                    >
                      $10.00
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    border: "1px solid #D4CEC4",
                    borderRadius: 16,
                    padding: 16,
                    cursor: "pointer",
                    background: "rgba(255,253,249,0.92)",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      minWidth: 20,
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: 3,
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping_choice"
                      value="express"
                      checked={shippingOption === "express"}
                      onChange={() => setShippingOption("express")}
                      required
                      style={{
                        margin: 0,
                        width: 14,
                        height: 14,
                        flex: "0 0 auto",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#1F2933" }}>
                      Express Shipping
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        color: "#5F5A54",
                        lineHeight: 1.5,
                      }}
                    >
                      Faster delivery option for your Carascan plate.
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 700,
                        color: "#1F2933",
                      }}
                    >
                      $15.00
                    </div>
                  </div>
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
                  <span>Unique QR Code laser engraved aluminium plate</span>
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
                      ? "10 x Emergency contacts subscription"
                      : "3 x Emergency contacts subscription"}
                  </span>
                  <strong>${subscriptionPrice}.00 / month</strong>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <span>
                    {shippingOption === "express"
                      ? "Express shipping"
                      : "Standard shipping"}
                  </span>
                  <strong>${shippingPrice}.00</strong>
                </div>

                <div
                  style={{
                    marginTop: 4,
                    marginBottom: 4,
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.5,
                  }}
                >
                  <div>Subscription choices are charged monthly automatically.</div>
                  <div>Shipping is charged once per order.</div>
                </div>

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
                      Includes plate + selected shipping + first month of selected
                      subscription
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