import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carascan",
  description: "QR plates for caravans with masked contact + emergency alerts."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
            <div>
              <div style={{fontWeight:800, fontSize:20}}>Carascan</div>
              <small>QR plates for caravans</small>
            </div>
            <nav style={{display:"flex", gap:10, alignItems:"center"}}>
              <a href="/buy">Buy</a>
              <a href="/admin/orders">Admin</a>
            </nav>
          </header>
          <hr />
          {children}
          <hr />
          <footer>
            <small>© {new Date().getFullYear()} Carascan. Messages are relayed without revealing owner details.</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
