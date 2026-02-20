import EmergencyClient from "./emergencyClient";
export default function EmergencyPage({ params }: { params: { slug: string } }) {
  return <EmergencyClient slug={params.slug} />;
}
