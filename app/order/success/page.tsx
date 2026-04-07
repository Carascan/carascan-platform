"use client";

import NavBar from "@/components/NavBar";

const HERO_IMAGE_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

export default function Success() {
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
              background: "rgba(255,253,249,0.94)",
              border: "1px solid #D4CEC4",
              borderRadius: 18,
              padding: 28,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              textAlign: "center",
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
              Order confirmed
            </p>

            <h1
              style={{
                margin: "0 0 18px 0",
                fontSize: "clamp(26px, 4.2vw, 36px)",
                lineHeight: 1.15,
                color: "#1F2933",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              You’re now part of the Carascan community
            </h1>

            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#5F5A54",
              }}
            >
              Time to hit the road. Your order is confirmed, and thank you for
              contributing to a safer travelling community.
            </p>

            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#5F5A54",
              }}
            >
              We’ve emailed you a secure setup link to configure your plate page
              and emergency contacts.
            </p>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.5,
                color: "#6b7280",
              }}
            >
              If you don’t see the email, check your spam or junk folder.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}