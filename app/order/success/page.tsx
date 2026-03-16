export default function Success() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        background: "#f7f7f8",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          textAlign: "center",
        }}
      >
      

        <h1
          style={{
            fontSize: 32,
            marginBottom: 18,
          }}
        >
          Order confirmed
        </h1>

        <p
          style={{
            fontSize: 16,
            marginBottom: 10,
            color: "#374151",
          }}
        >
          Time to hit the road! Your order is confirmed.
          Thank you for contributing to the community and looking out for each other.
        </p>

        <p
          style={{
            fontSize: 16,
            marginBottom: 10,
            color: "#374151",
          }}
        >
          We’ve emailed you a secure setup link to configure your plate page and
          emergency contacts.
        </p>

        <p
          style={{
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          If you don’t see the email, check your spam or junk folder.
        </p>
      </div>
    </main>
  );
}