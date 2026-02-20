import ContactClient from "./contactClient";
export default function ContactPage({ params }: { params: { slug: string } }) {
  return <ContactClient slug={params.slug} />;
}
