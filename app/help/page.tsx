const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

export default function HelpPage() {
  return (
    <>
      {/* 🔷 HEADER */}
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
          }}
        >
          <a href="/" style={{ display: "flex", alignItems: "center" }}>
            <img src={LOGO_URL} alt="Carascan" style={{ height: 28 }} />
          </a>

          <a
            href="/buy"
            style={{
              textDecoration: "none",
              background: "#111827",
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 999,
              fontWeight: 600,
              border: "1px solid #111827",
            }}
          >
            Buy now
          </a>
        </div>
      </header>

      {/* 🔷 PAGE */}
      <main
        style={{
          minHeight: "calc(100vh - 61px)",
          background: "#f7f7f8",
          padding: "32px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {/* 🔷 CARD */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 32,
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1
                style={{
                  margin: "0 0 12px 0",
                  fontSize: 32,
                  color: "#111827",
                }}
              >
                Carascan Help
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#4b5563",
                  lineHeight: 1.6,
                  fontSize: 16,
                }}
              >
                Tell us what you need help with and send us a message below.
              </p>
            </div>

            {/* FORM */}
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
                  defaultValue=""
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    background: "#ffffff",
                    color: "#111827",
                  }}
                >
                  <option value="" disabled>
                    Select a help topic
                  </option>
                  <option value="1">1. I have not received my setup email</option>
                  <option value="2">2. My setup link is not working</option>
                  <option value="3">3. I need to update my emergency contacts</option>
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
                  placeholder="Your email or phone number"
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
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
                  placeholder="Tell us what you need help with"
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 10,
                    padding: "12px 14px",
                    fontSize: 15,
                    boxSizing: "border-box",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            {/* ACTION */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 24,
              }}
            >
              <button
                type="button"
                style={{
                  background: "#111827",
                  color: "#ffffff",
                  padding: "12px 20px",
                  borderRadius: 12,
                  fontWeight: 600,
                  border: "1px solid #111827",
                  fontSize: 15,
                  cursor: "pointer",
                  minWidth: 180,
                }}
              >
                Send request
              </button>
            </div>

            {/* NOTE */}
            <p
              style={{
                margin: "14px 0 0 0",
                textAlign: "center",
                color: "#6b7280",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              Help requests will be connected next.
            </p>

            {/* BUSINESS DETAILS */}
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
              <div>Carascan Pty Ltd</div>
              <div>ABN: XX XXX XXX XXX</div>
              <div>© 2026 Carascan. All rights reserved.</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}