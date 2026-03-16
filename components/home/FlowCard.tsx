type FlowCardProps = {
  step: string;
  title: string;
  description: string;
};

export default function FlowCard({ step, title, description }: FlowCardProps) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        height: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
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
          color: "#111827",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.6,
          color: "#4b5563",
        }}
      >
        {description}
      </p>
    </article>
  );
}