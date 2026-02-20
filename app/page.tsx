export default function Home() {
  return (
    <main>
      <h1>Carascan</h1>
      <p>Laser-engraved QR plates for caravans. Scanners can send a message to the owner without seeing their details. Emergency alerts can notify multiple contacts via SMS + email.</p>
      <div className="card">
        <h3>How it works</h3>
        <ol>
          <li>Buy online</li>
          <li>Set up your plate page (caravan name, optional bio, emergency contacts)</li>
          <li>We generate the QR + engraving pack for LightBurn</li>
        </ol>
        <a className="btn" href="/buy">Buy a plate</a>
      </div>
    </main>
  );
}
