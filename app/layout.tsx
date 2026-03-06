import type { Metadata } from "next";
import type { ReactNode } from "react";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export const metadata: Metadata = {
  title: "Carascan",
  description: "Smart QR plates for caravans and vehicles",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#f7f7f8",
          color: "#111827",
        }}
      >
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <a
              href="/"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <img
                src={LOGO_URL}
                alt="Carascan"
                style={{
                  height: 32,
                  width: "auto",
                  display: "block",
                }}
              />
            </a>

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <a
                href="/buy"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#111827",
                  color: "#ffffff",
                }}
              >
                Buy Plate
              </a>
            </nav>
          </div>
        </header>

        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}