export default function Home() {
return (
<main
style={{
minHeight: "100vh",
padding: "32px 20px",
background: "#f7f7f8",
}}
>
<div
style={{
maxWidth: 760,
margin: "0 auto",
}}
>
<div
style={{
background: "#ffffff",
border: "1px solid #e5e7eb",
borderRadius: 18,
padding: 28,
boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
}}
>
<h1 style={{ marginTop: 0 }}>Carascan</h1>

```
      <p style={{ color: "#374151", lineHeight: 1.6 }}>
        Laser-engraved QR plates for caravans. If there is an emergency and
        someone is concerned they can scan the code on your caravan and
        notify your emergency contacts. No private information is available
        and you have the choice to respond.
      </p>

      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 20,
          marginTop: 20,
        }}
      >
        <h3 style={{ marginTop: 0 }}>How it works</h3>

        <ol style={{ lineHeight: 1.7 }}>
          <li>Buy online</li>
          <li>Set up your plate page</li>
          <li>We generate the QR engraving pack for LightBurn</li>
        </ol>

        <a
          href="/buy"
          style={{
            display: "inline-block",
            marginTop: 10,
            textDecoration: "none",
            border: 0,
            borderRadius: 12,
            padding: "14px 20px",
            fontSize: 16,
            fontWeight: 600,
            background: "#111827",
            color: "#ffffff",
          }}
        >
          Buy a plate
        </a>
      </div>
    </div>
  </div>
</main>
```

);
}
