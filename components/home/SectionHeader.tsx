type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  maxWidth?: number;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  maxWidth = 720,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div
      style={{
        maxWidth,
        margin: isCentered ? "0 auto" : "0",
        textAlign: align,
      }}
    >
      {eyebrow ? (
        <p
          style={{
            margin: "0 0 10px 0",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: "#4F6F64",
          }}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        style={{
          margin: "0 0 14px 0",
          fontSize: "clamp(30px, 5vw, 44px)",
          lineHeight: 1.08,
          color: "#1F2933",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>

      {description ? (
        <p
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.6,
            color: "#6B7280",
          }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}