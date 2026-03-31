type FlowCardProps = {
  step: string;
  title: string;
  description: string;
};

export default function FlowCard({ step, title, description }: FlowCardProps) {
  return (
    <article
      style={{
        background: "#FFFDF9",
        border: "1px solid #D4CEC4",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#F0E2D6",
          color: "#C96A2B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 16,
          border: "1px solid #E3C8B2",
        }}
      >
        {step}
      </div>

      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: 22,
          lineHeight: 1.2,
          color: "#1F2933",
          fontWeight: 600,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.6,
          color: "#5F5A54",
        }}
      >
        {description}
      </p>
    </article>
  );
}