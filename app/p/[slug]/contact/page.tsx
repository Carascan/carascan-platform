import ContactClient from "./contactClient";
import { supabaseAdmin } from "@/lib/supabaseServer";

export default async function ContactPage({
params,
}: {
params: { slug: string };
}) {
const sb = supabaseAdmin();

const { data: plate } = await sb
.from("plates")
.select("id, contact_enabled, emergency_enabled, status")
.eq("slug", params.slug)
.maybeSingle();

if (!plate || plate.status === "disabled") {
return ( <main> <h1>Plate not found</h1> <div className="card"> <b>This plate is not available.</b> </div> </main>
);
}

return ( <ContactClient
   slug={params.slug}
   allowContactOwner={!!plate.contact_enabled}
   allowEmergency={!!plate.emergency_enabled}
 />
);
}
