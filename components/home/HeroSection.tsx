type HeroCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function HeroCard({ icon, title, description }: HeroCardProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        background: "rgba(255,253,249,0.94)",
        padding: 18,
        border: "1px solid #D4CEC4",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        minHeight: 210,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 16,
    minHeight: 30,
  }}
>
  {icon}
</div>

      <strong
        style={{
          display: "block",
          marginBottom: 10,
          color: "#1F2933",
          fontSize: 16,
          lineHeight: 1.25,
        }}
      >
        {title}
      </strong>

      <span
        style={{
          color: "#5F5A54",
          lineHeight: 1.55,
          fontSize: 15,
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {description}
      </span>
    </div>
  );
}

export default function HeroSection() {
  const IMAGE_URL =
    "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg";

  return (
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          margin: "0 auto",
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
            Smart QR plates for caravans
          </p>

          <h1
            style={{
              margin: "0 0 18px 0",
              fontSize: "clamp(42px, 7vw, 64px)",
              lineHeight: 1.02,
              color: "#1F2933",
              maxWidth: 760,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Help people contact you quickly without exposing your personal details
          </h1>

          <p
            style={{
              margin: "0 0 28px 0",
              fontSize: 20,
              lineHeight: 1.6,
              color: "#5F5A54",
              maxWidth: 680,
            }}
          >
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

        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  }}
>
          <HeroCard
            icon={
  <img
    src="/icons/qrCode.svg"
    alt="QR code icon"
    style={{ width: 50, height: 50, display: "block" }}
  />
}
            title="Scan the plate"
            description="Locate the owners unique QR code plate. Using the camera on your phone, follow the link to access the customers public page."
          />

          <HeroCard
            icon={
  <img
    src="/icons/doorKnock.svg"
    alt="Door knock icon"
    style={{ width: 30, height: 30, display: "block" }}
  />
}
            title="Contact owner"
            description={`Knock, knock. Is anyone home? If the owner allows it, you can leave a message to say G'day without any owner personal details being available.`}
          />

          <HeroCard
            icon={
  <img
    src="/icons/satelliteDish.svg"
    alt="Location reporting icon"
    style={{ width: 30, height: 30, display: "block" }}
  />
}
            title="Location reporting"
            description="If something doesnt feel right, report the location and the owner will be alerted."
          />

          <HeroCard
            icon={
  <img
    src="/icons/sirenFlash.svg"
    alt="Emergency icon"
    style={{ width: 30, height: 30, display: "block" }}
  />
}
            title="Emergency alerts"
            description="Notify the owner and emergency contacts when urgent help is needed."
          />
        </div>
      </div>
    </section>
  );
}