// app/admin/orders/page.tsx
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("orders")
    .select("id, created_at, status, amount_total_cents, currency, stripe_checkout_session_id, plate_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Orders</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Orders</h1>
      <p>Rows: {data?.length ?? 0}</p>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}