export default function TravelImageSection() {
  return (
    <section
      style={{
        padding: "72px 20px",
        background: "#F3F1EC",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
          }}
        >
          <img
            src="https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/home/carascan-beach-drone-capture.jpg"
            alt="Caravan on an Australian beach"
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>
  );
}