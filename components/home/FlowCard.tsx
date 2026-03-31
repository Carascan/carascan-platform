type FlowCardProps = {
  step: string;
  title: string;
  description: string;
};

export default function FlowCard({ step, title, description }: FlowCardProps) {
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#E6EFEC",
          color: "#3E5A50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 16,
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
          color: "#6B7280",
        }}
      >
        {description}
      </p>
    </article>
  );
}