"use client";

import { useEffect, useState } from "react";

export default function NavBar() {
  const LOGO_URL =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 860;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(20,26,32,0.94)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #2B3138",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "14px 16px" : "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          minHeight: isMobile ? 72 : 78,
          position: "relative",
        }}
      >
        <a
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            flexShrink: 1,
            minWidth: 0,
            maxWidth: isMobile ? "calc(100% - 64px)" : "none",
          }}
        >
          <img
            src={LOGO_URL}
            alt="Carascan"
            style={{
              height: isMobile ? 34 : 44,
              width: "auto",
              maxWidth: isMobile ? "100%" : "none",
              display: "block",
              filter: "brightness(0) invert(1)",
            }}
          />
        </a>

        {!isMobile && (
          <nav
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              fontSize: 14,
              color: "#F3F1EC",
              flexShrink: 0,
            }}
          >
            <a href="#preview" style={{ color: "inherit", textDecoration: "none" }}>
              Preview
            </a>

            <a href="#flow" style={{ color: "inherit", textDecoration: "none" }}>
              How it works
            </a>

            <a href="#details" style={{ color: "inherit", textDecoration: "none" }}>
              Details
            </a>

            <a
              href="/buy"
              style={{
                textDecoration: "none",
                background: "#C96A2B",
                color: "#FFFFFF",
                padding: "10px 16px",
                borderRadius: 12,
                fontWeight: 700,
                boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                whiteSpace: "nowrap",
              }}
            >
              Buy now
            </a>
          </nav>
        )}

        {isMobile && (
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              border: "1px solid #3A424B",
              background: "rgba(255,255,255,0.04)",
              color: "#F3F1EC",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 2,
                  background: "#F3F1EC",
                  borderRadius: 999,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 2,
                  background: "#F3F1EC",
                  borderRadius: 999,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 18,
                  height: 2,
                  background: "#F3F1EC",
                  borderRadius: 999,
                }}
              />
            </span>
          </button>
        )}

        {isMobile && menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 16,
              left: 16,
              background: "rgba(26,33,40,0.98)",
              border: "1px solid #2F3740",
              borderRadius: 16,
              padding: 12,
              boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <a
                href="#preview"
                onClick={closeMenu}
                style={{
                  color: "#F3F1EC",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: 12,
                }}
              >
                Preview
              </a>

              <a
                href="#flow"
                onClick={closeMenu}
                style={{
                  color: "#F3F1EC",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: 12,
                }}
              >
                How it works
              </a>

              <a
                href="#details"
                onClick={closeMenu}
                style={{
                  color: "#F3F1EC",
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: 12,
                }}
              >
                Details
              </a>

              <a
                href="/buy"
                onClick={closeMenu}
                style={{
                  textDecoration: "none",
                  background: "#C96A2B",
                  color: "#FFFFFF",
                  padding: "12px 14px",
                  borderRadius: 12,
                  fontWeight: 700,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Buy now
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}