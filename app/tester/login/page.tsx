"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";

const BACKGROUND_IMAGE =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

export default function TesterLoginPage() {
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleLogin() {
    if (!firstName.trim() || !password.trim()) {
      setStatus("Enter your first name and password.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch("/api/tester/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.error || "Login failed.");
        return;
      }

      window.location.href = "/tester";
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar variant="inner" />

      <main
        style={{
          minHeight: "calc(100vh - 78px)",
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
              objectPosition: "50% 58%",
              display: "block",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(231,226,216,0.88) 0%, rgba(231,226,216,0.74) 35%, rgba(231,226,216,0.48) 60%, rgba(231,226,216,0.60) 100%)",
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
            minHeight: "calc(100vh - 78px)",
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
              Carascan tester portal
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
              Private sandbox access for selected testers
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
              Use your first name and the shared tester password to access the
              private testing area.
            </p>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 620,
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
                Tester login
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#5F5A54",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                This page is for approved sandbox testers only.
              </p>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label
                  htmlFor="tester-first-name"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1F2933",
                  }}
                >
                  First name
                </label>

                <input
                  id="tester-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
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
                  htmlFor="tester-password"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1F2933",
                  }}
                >
                  Password
                </label>

                <input
                  id="tester-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter shared tester password"
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
                disabled={loading}
                onClick={handleLogin}
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
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
                }}
              >
                {loading ? "Checking..." : "Enter portal"}
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
          </div>
        </div>
      </main>
    </>
  );
}