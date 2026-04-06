"use client";

type HeroCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function HeroCard({ icon, title, description }: HeroCardProps) {
  return (
    <div className="hero-card">
      <div className="hero-card-icon">{icon}</div>

      <strong className="hero-card-title">{title}</strong>

      <span className="hero-card-description">{description}</span>
    </div>
  );
}

export default function HeroSection() {
  const IMAGE_URL =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

  return (
    <>
      <section
        style={{
          position: "relative",
          padding: "88px 20px 72px",
          overflow: "hidden",
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
            src={IMAGE_URL}
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
                "linear-gradient(to right, rgba(231,226,216,0.82) 0%, rgba(231,226,216,0.65) 35%, rgba(231,226,216,0.35) 60%, rgba(231,226,216,0.55) 100%)",
            }}
          />
        </div>

        <div className="hero-inner">
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
              Smart QR plates for caravans
            </p>

            <h1 className="hero-heading">
              Help people contact you quickly without exposing your personal details
            </h1>

            <p className="hero-copy">
              Carascan QR plates can let a person "Virtual Doorknock", Report a location, or in
              emergency, alert the your emergency contacts through email and SMS.
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
                href="#preview"
                style={{
                  textDecoration: "none",
                  background: "rgba(243,241,236,0.92)",
                  color: "#1F2933",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontWeight: 700,
                  border: "1px solid #B9B1A5",
                  backdropFilter: "blur(4px)",
                }}
              >
                Preview the plate
              </a>
            </div>
          </div>

          <div className="hero-card-grid">
            <HeroCard
              icon={
                <img
                  src="/icons/qrCode.svg"
                  alt="QR code icon"
                  className="hero-icon-image"
                />
              }
              title="Scan the plate"
              description="Scan the unique QR code with a device and access the public contact page"
            />

            <HeroCard
              icon={
                <img
                  src="/icons/doorKnock.svg"
                  alt="Door knock icon"
                  className="hero-icon-image"
                />
              }
              title="Contact owner"
              description={`Knock, knock. Is anyone home? Send a message via SMS or email`}
            />

            <HeroCard
              icon={
                <img
                  src="/icons/satelliteDish.svg"
                  alt="Location reporting icon"
                  className="hero-icon-image"
                />
              }
              title="Location reporting"
              description="If something doesnt feel right, report the exact location for the owner."
            />

            <HeroCard
              icon={
                <img
                  src="/icons/sirenFlash.svg"
                  alt="Emergency icon"
                  className="hero-icon-image"
                />
              }
              title="Emergency alerts"
              description="Notify the owner and emergency contacts when urgent help is needed."
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 40px;
          align-items: center;
        }

        .hero-heading {
          margin: 0 0 18px 0;
          font-size: clamp(42px, 7vw, 64px);
          line-height: 1.02;
          color: #1f2933;
          max-width: 760px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .hero-copy {
          margin: 0 0 28px 0;
          font-size: 20px;
          line-height: 1.6;
          color: #5f5a54;
          max-width: 680px;
        }

        .hero-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .hero-card {
          border-radius: 18px;
          background: rgba(255, 253, 249, 0.94);
          padding: 18px;
          border: 1px solid #d4cec4;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          min-height: 210px;
          display: flex;
          flex-direction: column;
        }

        .hero-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f1ec;
          border: 1px solid #d4cec4;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .hero-icon-image {
          width: 30px;
          height: 30px;
          display: block;
          object-fit: contain;
        }

        .hero-card-title {
          display: block;
          margin-bottom: 10px;
          color: #1f2933;
          font-size: 16px;
          line-height: 1.25;
        }

        .hero-card-description {
          color: #5f5a54;
          line-height: 1.55;
          font-size: 15px;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .hero-inner {
            gap: 28px;
          }

          .hero-card-grid {
            grid-template-columns: 1fr;
          }

          .hero-card {
            min-height: 0;
          }
        }

        @media (max-width: 640px) {
          .hero-heading {
            font-size: clamp(34px, 10vw, 48px);
            line-height: 1.04;
          }

          .hero-copy {
            font-size: 17px;
            line-height: 1.55;
            max-width: none;
          }

          .hero-card {
            padding: 16px;
          }

          .hero-card-icon {
            width: 40px;
            height: 40px;
            margin-bottom: 14px;
          }

          .hero-icon-image {
            width: 24px;
            height: 24px;
          }

          .hero-card-description {
            -webkit-line-clamp: unset;
            overflow: visible;
            display: block;
          }
        }
      `}</style>
    </>
  );
}