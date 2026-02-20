export default function Buy() {
  return (
    <main>
      <h1>Buy Carascan Plate</h1>
      <div className="card">
        <p><b>Plate:</b> Anodised Aluminium, 60×90mm (R3 corners), Ø4.2 hole marks (engraved), 40×40 QR in bottom half.</p>
        <form action="/api/checkout/create" method="post">
          <button className="btn" type="submit">Checkout</button>
        </form>
        <p><small>Payment handled by Stripe Checkout.</small></p>
      </div>
    </main>
  );
}
