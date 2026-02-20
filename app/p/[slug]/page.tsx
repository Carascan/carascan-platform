import { notFound } from "next/navigation";

async function getPlate(slug: string) {
  const r = await fetch(`${process.env.APP_BASE_URL}/api/plates/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!r.ok) return null;
  return r.json();
}

export default async function PlatePage({ params }: { params: { slug: string } }) {
  const data = await getPlate(params.slug);
  if (!data) return notFound();

  return (
    <main>
      <h1>{data.profile.caravan_name}</h1>
      {data.profile.bio && <p>{data.profile.bio}</p>}
      <div className="card">
        <h3>Actions</h3>
        {data.plate.contact_enabled ? (
          <a className="btn" href={`/p/${params.slug}/contact`}>Contact</a>
        ) : (
          <p><small>Contact is disabled for this plate.</small></p>
        )}
        {" "}
        {data.plate.emergency_enabled ? (
          <a className="btn secondary" href={`/p/${params.slug}/emergency`}>In Case of Emergency</a>
        ) : (
          <p><small>Emergency is disabled for this plate.</small></p>
        )}
      </div>
      <small>Owner details are not displayed. Messages are relayed.</small>
    </main>
  );
}
