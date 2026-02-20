export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function AdminOrders() {
  const sb = supabaseAdmin();
  const { data: orders, error } = await sb
    .from("orders")
    .select("id, status, created_at, amount_total_cents, currency, shipping_name, plate_id")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main>
      <h1>Admin • Orders</h1>
      {error && <div className="card"><b>Error:</b> {error.message}</div>}
      <div className="card">
        <p><small>Laser pack download is an SVG for LightBurn. Click a button per order.</small></p>
      </div>
      {(orders ?? []).map((o:any) => (
        <div className="card" key={o.id}>
          <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
            <div>
              <b>Order</b> {o.id}<br/>
              <small>{new Date(o.created_at).toLocaleString()}</small><br/>
              <small>Status: {o.status}</small><br/>
              <small>Ship to: {o.shipping_name ?? "-"}</small>
            </div>
            <div>
              <small>Plate ID:</small><br/>
              <code style={{fontSize:12}}>{o.plate_id ?? "-"}</code><br/>
              {o.plate_id && <a className="btn" href={`/api/laser-pack/${o.plate_id}`}>Download Laser Pack</a>}
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
