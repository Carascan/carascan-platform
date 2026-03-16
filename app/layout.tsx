import type { Metadata } from "next";
import type { ReactNode } from "react";

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