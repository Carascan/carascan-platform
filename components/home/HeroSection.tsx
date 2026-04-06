function QrIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect x="3" y="3" width="6" height="6" rx="1" stroke="#1F2933" strokeWidth="1.8" />
      <rect x="15" y="3" width="6" height="6" rx="1" stroke="#1F2933" strokeWidth="1.8" />
      <rect x="3" y="15" width="6" height="6" rx="1" stroke="#1F2933" strokeWidth="1.8" />
      <path
        d="M15 15H17V17H15V15ZM17 17H19V19H17V17ZM19 15H21V17H19V15ZM15 19H17V21H15V19ZM19 19H21V21H19V19Z"
        fill="#1F2933"
      />
    </svg>
  );
}

function KnockIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M7.5 11.5V7.2C7.5 6.25 8.25 5.5 9.2 5.5C10.15 5.5 10.9 6.25 10.9 7.2V11.5"
        stroke="#1F2933"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.9 11.5V6.4C10.9 5.4 11.65 4.65 12.65 4.65C13.65 4.65 14.4 5.4 14.4 6.4V11.5"
        stroke="#1F2933"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14.4 11.5V7.1C14.4 6.2 15.1 5.5 16 5.5C16.9 5.5 17.6 6.2 17.6 7.1V12.6C17.6 15.9 15.1 18.4 11.8 18.4H10.8C8.15 18.4 6 16.25 6 13.6V11.8C6 10.95 6.7 10.25 7.55 10.25C8.4 10.25 9.1 10.95 9.1 11.8V13"
        stroke="#1F2933"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M12 20C12 20 18 14.4 18 10.2C18 6.78 15.31 4 12 4C8.69 4 6 6.78 6 10.2C6 14.4 12 20 12 20Z"
        stroke="#1F2933"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="#1F2933" strokeWidth="1.8" />
    </svg>
  );
}

function EmergencyIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M8 15.5H16L14.8 9.2C14.55 7.9 13.42 7 12.1 7H11.9C10.58 7 9.45 7.9 9.2 9.2L8 15.5Z"
        stroke="#1F2933"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M7 18H17" stroke="#1F2933" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4.5V2.8" stroke="#1F2933" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5.6 6.2L4.4 5" stroke="#1F2933" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.4 6.2L19.6 5" stroke="#1F2933" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
          width: 44,
          height: 44,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F3F1EC",
          border: "1px solid #D4CEC4",
          marginBottom: 14,
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
            background: "rgba(231,226,216,0.86)",
            border: "1px solid rgba(212,206,196,0.95)",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
            backdropFilter: "blur(6px)",
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          <HeroCard
            icon={<QrIcon />}
            title="Scan the plate"
            description="Locate the owners unique QR code plate. Using the camera on your phone, follow the link to access the customers public page."
          />

          <HeroCard
            icon={<KnockIcon />}
            title="Contact owner"
            description={`Knock, knock. Is anyone home? If the owner allows it, you can leave a message to say G'day without any owner personal details being available.`}
          />

          <HeroCard
            icon={<PinIcon />}
            title="Location reporting"
            description="If something doesnt feel right, report the location and the owner will be alerted."
          />

          <HeroCard
            icon={<EmergencyIcon />}
            title="Emergency alerts"
            description="Notify the owner and emergency contacts when urgent help is needed."
          />
        </div>
      </div>
    </section>
  );
}