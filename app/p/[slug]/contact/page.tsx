import ContactClient from "./contactClient";

export default async function ContactPage({
  params,
}: {
  params: { slug: string };
}) {
  const baseUrl = process.env.APP_BASE_URL;

  if (!baseUrl) {
    return (
      <main>
        <h1>Configuration error</h1>
        <div className="card">
          <b>APP_BASE_URL is missing.</b>
        </div>
      </main>
    );
  }

  const res = await fetch(
    `${baseUrl}/api/plates/${encodeURIComponent(params.slug)}`,
    { cache: "no-store" }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok || !data) {
    return (
      <main>
        <h1>Plate not found</h1>
        <div className="card">
          <b>{data?.error ?? "This plate is not available."}</b>
        </div>
      </main>
    );
  }

  return (
    <ContactClient
      slug={data.slug}
      allowContactOwner={!!data.allowContactOwner}
      allowEmergency={!!data.allowEmergency}
    />
  );
}
