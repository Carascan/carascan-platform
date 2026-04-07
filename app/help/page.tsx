"use client";

import { useEffect, useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const BACKGROUND_IMAGE =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

export default function HelpPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [topic, setTopic] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 860);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,253,249,0.88)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #d4cec4",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={LOGO_URL} alt="Carascan" style={{ height: 28 }} />
          </a>

          <a
            href="/help"
            style={{
              textDecoration: "none",
              background: "#1F2933",
              color: "#FFFFFF",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 700,
              border: "1px solid #1F2933",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            Help
          </a>
        </div>
      </header>

      <main
        style={{
          minHeight: "calc(100vh - 61px)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
          background: "#E7E2D8",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          <img
            src={BACKGROUND_IMAGE}
            alt="Caravan travelling along the Australian coastline"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: isMobile ? "30% center" : "50% 58%",
              display: "block",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(231,226,216,0.86) 0%, rgba(231,226,216,0.70) 35%, rgba(231,226,216,0.42) 60%, rgba(231,226,216,0.58) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "72px 20px 80px",
            minHeight: "calc(100vh - 61px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 40,
            alignItems: "center",
          }}
        >
          <div>
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
              Carascan support
            </p>

            <h1
              style={{
                margin: "0 0 18px 0",
                fontSize: "clamp(40px, 7vw, 60px)",
                lineHeight: 1.04,
                color: "#1F2933",
                maxWidth: 720,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Get help with your plate, setup link, or contact details
            </h1>

            <p
              style={{
                margin: "0 0 28px 0",
                fontSize: 20,
                lineHeight: 1.6,
                color: "#5F5A54",
                maxWidth: 640,
              }}
            >
              Send us your request and we will review it as quickly as possible.
              Use this page for setup issues, plate page updates, emergency
              contact changes, or anything else you need help with.
            </p>

            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <a
                href="/buy"
                style={{
                  textDecoration: "none",
                  background: "#1F2933",
                  color: "#FFFFFF",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                }}
              >
                Buy your plate
              </a>

              <a
                href="#help-form"
                style={{
                  textDecoration: "none",
                  background: "rgba(255,253,249,0.92)",
                  color: "#1F2933",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  border: "1px solid #B9B1A5",
                  backdropFilter: "blur(4px)",
                }}
              >
                Open help form
              </a>
            </div>
          </div>

          <div
            id="help-form"
            style={{
              width: "100%",
              maxWidth: 760,
              justifySelf: "end",
              borderRadius: 18,
              background: "rgba(255,253,249,0.94)",
              padding: 24,
              border: "1px solid #D4CEC4",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 28,
                  lineHeight: 1.15,
                  color: "#1F2933",
                }}
              >
                Help request
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#5F5A54",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                Complete the form below and we will get back to you.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
              }}
            >
              <div>
                <label
                  htmlFor="help-topic"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1F2933",
                  }}
                >
                  Help topic
                </label>

                <select
                  id="help-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid #D4CEC4",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    background: "#FFFFFF",
                    color: "#1F2933",
                    outline: "none",
                  }}
                >
                  <option value="" disabled>
                    Select a help topic
                  </option>
                  <option value="1">1. I have not received my setup email</option>
                  <option value="2">2. My setup link is not working</option>
                  <option value="3">
                    3. I need to update my emergency contacts
                  </option>
                  <option value="4">4. I need help with my plate page</option>
                  <option value="5">5. Something else</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-detail"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1F2933",
                  }}
                >
                  Contact detail
                </label>

                <input
                  id="contact-detail"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Your email or phone number"
                  style={{
                    width: "100%",
                    border: "1px solid #D4CEC4",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    color: "#1F2933",
                    background: "#FFFFFF",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="help-message"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1F2933",
                  }}
                >
                  Message
                </label>

                <textarea
                  id="help-message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with"
                  style={{
                    width: "100%",
                    border: "1px solid #D4CEC4",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    resize: "vertical",
                    color: "#1F2933",
                    background: "#FFFFFF",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 24,
              }}
            >
              <button
                type="button"
                disabled={sending}
                onClick={async () => {
                  if (!topic || !contact.trim() || !message.trim()) {
                    setStatus("Please complete all fields.");
                    return;
                  }

                  try {
                    setSending(true);
                    setStatus("");

                    const res = await fetch("/api/help", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        topic,
                        contact,
                        message,
                      }),
                    });

                    if (!res.ok) {
                      throw new Error("Failed");
                    }

                    setStatus("Request sent successfully.");
                    setTopic("");
                    setContact("");
                    setMessage("");
                  } catch {
                    setStatus("Something went wrong. Please try again.");
                  } finally {
                    setSending(false);
                  }
                }}
                style={{
                  background: "#1F2933",
                  color: "#FFFFFF",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  border: "1px solid #1F2933",
                  fontSize: 15,
                  cursor: "pointer",
                  minWidth: 190,
                  opacity: sending ? 0.7 : 1,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                }}
              >
                {sending ? "Sending..." : "Send request"}
              </button>
            </div>

            {status ? (
              <p
                style={{
                  margin: "14px 0 0 0",
                  textAlign: "center",
                  color: "#5F5A54",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {status}
              </p>
            ) : null}

            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: "1px solid #D4CEC4",
                textAlign: "center",
                color: "#5F5A54",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <div>Conolan Projects Pty Ltd T/A Carascan</div>
              <div>ABN: 92 687 895 665</div>
              <div>© 2026 Carascan. All rights reserved.</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}