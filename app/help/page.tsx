"use client";

import { useState } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80";

export default function HelpPage() {
  const [topic, setTopic] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e7eb",
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
              background: "#111827",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #111827",
              whiteSpace: "nowrap",
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
          backgroundColor: "#e7e2d8",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${BACKGROUND_IMAGE})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(17,24,39,0.42) 0%, rgba(17,24,39,0.58) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1200,
            margin: "0 auto",
            padding: "56px 20px 72px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 61px)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 820,
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: 24,
              padding: 32,
              boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h1
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "clamp(30px, 5vw, 42px)",
                  lineHeight: 1.1,
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                Carascan Help
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#4b5563",
                  lineHeight: 1.65,
                  fontSize: 16,
                  maxWidth: 580,
                  marginInline: "auto",
                }}
              >
                Tell us what you need help with and send us a message below.
                We will review your request and get back to you as soon as
                possible.
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
                    fontWeight: 600,
                    color: "#111827",
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
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    background: "#ffffff",
                    color: "#111827",
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
                    fontWeight: 600,
                    color: "#111827",
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
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    color: "#111827",
                    background: "#ffffff",
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
                    fontWeight: 600,
                    color: "#111827",
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
                    border: "1px solid #d1d5db",
                    borderRadius: 12,
                    padding: "13px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    resize: "vertical",
                    color: "#111827",
                    background: "#ffffff",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 26,
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
                  background: "#111827",
                  color: "#ffffff",
                  padding: "13px 22px",
                  borderRadius: 14,
                  fontWeight: 600,
                  border: "1px solid #111827",
                  fontSize: 15,
                  cursor: "pointer",
                  minWidth: 190,
                  opacity: sending ? 0.7 : 1,
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
                  color: "#6b7280",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {status}
              </p>
            ) : null}

            <div
              style={{
                marginTop: 32,
                paddingTop: 20,
                borderTop: "1px solid #e5e7eb",
                textAlign: "center",
                color: "#6b7280",
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