import NavBar from "@/components/NavBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

function getTesterNameFromCookie(raw: string | undefined) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.firstName === "string" && parsed.firstName.trim()) {
      return parsed.firstName.trim();
    }
    return null;
  } catch {
    return null;
  }
}

export default async function TesterPortalPage() {
  const cookieStore = await cookies();
  const testerCookie = cookieStore.get("carascan_tester_portal")?.value;
  const firstName = getTesterNameFromCookie(testerCookie);

  if (!firstName) {
    redirect("/tester/login");
  }

  return (
    <>
      <NavBar variant="inner" />

      <main
        style={{
          minHeight: "calc(100vh - 78px)",
          background: "#E7E2D8",
          padding: "40px 20px 80px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gap: 24,
          }}
        >
          <div
            style={{
              borderRadius: 18,
              background: "rgba(255,253,249,0.94)",
              padding: 24,
              border: "1px solid #D4CEC4",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#C96A2B",
              }}
            >
              Tester portal
            </p>

            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: "clamp(32px, 6vw, 48px)",
                lineHeight: 1.08,
                color: "#1F2933",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome, {firstName}
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                color: "#5F5A54",
                maxWidth: 760,
              }}
            >
              This page is for selected sandbox testers. Please follow the test
              process below and provide feedback on anything unclear, broken, or
              confusing.
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "rgba(255,253,249,0.94)",
              padding: 24,
              border: "1px solid #D4CEC4",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <div
  style={{
    width: "100%",
    minHeight: 280,
    borderRadius: 16,
    border: "1px solid #D4CEC4",
    overflow: "hidden",
    background: "#F3F1EC",
    boxSizing: "border-box",
  }}
>
  <img
    src="https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/Sandbox%20Card%20Details.png"
    alt="Sandbox test details"
    style={{
      width: "100%",
      height: "100%",
      minHeight: 280,
      objectFit: "cover",
      display: "block",
    }}
  />
</div>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "rgba(255,253,249,0.94)",
              padding: 24,
              border: "1px solid #D4CEC4",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                margin: "0 0 14px 0",
                fontSize: 26,
                color: "#1F2933",
                lineHeight: 1.15,
              }}
            >
              Tester instructions
            </h2>

            <div
              style={{
                color: "#5F5A54",
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              <div>1. Open the live homepage and review the overall layout.</div>
              <div>2. Run through the sandbox purchase flow.</div>
              <div>3. Complete the setup process from the email link.</div>
              <div>4. Check the public plate page and messaging flow.</div>
              <div>5. Test the Help page and report anything unclear.</div>
              <div>6. Send feedback with screenshots where possible.</div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "rgba(255,253,249,0.94)",
              padding: 24,
              border: "1px solid #D4CEC4",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px 0",
                fontSize: 24,
                color: "#1F2933",
              }}
            >
              Return to live site
            </h2>

            <p
              style={{
                margin: "0 0 18px 0",
                color: "#5F5A54",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Use the Carascan logo below to open the main homepage.
            </p>

            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <img
                src={LOGO_URL}
                alt="Carascan"
                style={{
                  height: 42,
                  width: "auto",
                  display: "block",
                }}
              />
            </a>
          </div>

          <form
            action="/api/tester/logout"
            method="POST"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <button
              type="submit"
              style={{
                background: "#1F2933",
                color: "#FFFFFF",
                padding: "12px 18px",
                borderRadius: 12,
                fontWeight: 700,
                border: "1px solid #1F2933",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </form>
        </div>
      </main>
    </>
  );
}