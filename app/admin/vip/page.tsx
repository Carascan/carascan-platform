import crypto from "crypto";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/AdminHeader";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ENV } from "@/lib/env";
import { buildPlateAssets } from "@/lib/buildPlateAssets";
import { buildManufacturingEmailPayload } from "@/lib/buildManufacturingEmailPayload";
import { buildCustomerPlateEmailPayload } from "@/lib/buildCustomerPlateEmailPayload";
import { buildVipTrialEmailPayload } from "@/lib/buildVipTrialEmailPayload";
import { buildShippingLabelSvg } from "@/lib/shippingLabelSvg";
import { sendManufacturingEmail } from "@/lib/notifyEmail";
import { sendCustomerPlateEmail } from "@/lib/sendCustomerPlateEmail";
import { sendVipTrialEmail } from "@/lib/sendVipTrialEmail";

const LOGO_URL_FALLBACK =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const ASSETS_BUCKET = ENV.PLATE_ASSETS_BUCKET;
const MANUFACTURING_EMAIL_TO = ENV.MANUFACTURING_EMAIL;

function formatIdentifier(num: number) {
  return `CSN-${String(num).padStart(6, "0")}`;
}

function randToken(len = 48) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

function identifierToNumber(identifier: string) {
  const match = /^CSN-(\d{6})$/.exec(identifier);
  return match ? Number(match[1]) : null;
}

async function loadLogoSvgDataUrl(logoUrl: string): Promise<string> {
  try {
    const response = await fetch(logoUrl, { cache: "no-store" });

    if (!response.ok) {
      return "";
    }

    const svgText = await response.text();
    const base64 = Buffer.from(svgText, "utf8").toString("base64");
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    return "";
  }
}

async function uploadPlateAssets(
  sb: ReturnType<typeof supabaseAdmin>,
  assets: Awaited<ReturnType<typeof buildPlateAssets>>
) {
  const prefix = `plates/${assets.identifier}`;

  const qrPath = `${prefix}/qr.png`;
  const svgPath = `${prefix}/plate.svg`;
  const metadataPath = `${prefix}/metadata.json`;

  const qrUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(qrPath, assets.qrPngBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (qrUpload.error) {
    throw new Error(`QR upload failed: ${qrUpload.error.message}`);
  }

  const svgUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(svgPath, assets.plateSvg, {
      contentType: "image/svg+xml",
      upsert: true,
    });

  if (svgUpload.error) {
    throw new Error(`SVG upload failed: ${svgUpload.error.message}`);
  }

  const metadataUpload = await sb.storage
    .from(ASSETS_BUCKET)
    .upload(metadataPath, JSON.stringify(assets.metadata, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (metadataUpload.error) {
    throw new Error(`Metadata upload failed: ${metadataUpload.error.message}`);
  }

  const { data: qrPublic } = sb.storage.from(ASSETS_BUCKET).getPublicUrl(qrPath);
  const { data: svgPublic } = sb.storage.from(ASSETS_BUCKET).getPublicUrl(svgPath);
  const { data: metadataPublic } = sb.storage
    .from(ASSETS_BUCKET)
    .getPublicUrl(metadataPath);

  return {
    qrPublicUrl: qrPublic?.publicUrl ?? null,
    svgPublicUrl: svgPublic?.publicUrl ?? null,
    metadataPublicUrl: metadataPublic?.publicUrl ?? null,
  };
}

async function allocateVipPlate(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!name || !address || !email) {
    redirect("/admin/vip?error=Missing%20required%20fields");
  }

  const sb = supabaseAdmin();
  const logoUrl = ENV.PLATE_LOGO_SVG_URL ?? LOGO_URL_FALLBACK;
  const logoImageHref = await loadLogoSvgDataUrl(logoUrl);

  const identifiers = Array.from({ length: 20 }, (_, i) =>
    formatIdentifier(180 + i)
  );

  const { data: plates, error: plateError } = await sb
    .from("plates")
    .select("id, identifier, slug, status")
    .in("identifier", identifiers)
    .order("identifier", { ascending: true });

  if (plateError) {
    redirect(
      `/admin/vip?error=${encodeURIComponent(
        `Plate lookup failed: ${plateError.message}`
      )}`
    );
  }

  if (!plates || plates.length === 0) {
    redirect("/admin/vip?error=No%20trial%20plates%20found");
  }

  const plateIds = plates.map((p) => p.id);

  const { data: tokens, error: tokenError } = await sb
    .from("plate_setup_tokens")
    .select("plate_id, email, revoked_at, used_at")
    .in("plate_id", plateIds);

  if (tokenError) {
    redirect(
      `/admin/vip?error=${encodeURIComponent(
        `Token lookup failed: ${tokenError.message}`
      )}`
    );
  }

  const allocatedPlateIds = new Set(
    (tokens ?? []).filter((t) => !t.revoked_at).map((t) => t.plate_id)
  );

  const availablePlate = plates.find((p) => !allocatedPlateIds.has(p.id));

  if (!availablePlate) {
    redirect("/admin/vip?error=No%20available%20VIP%20trial%20plates%20remaining");
  }

  const assets = await buildPlateAssets({
    identifier: availablePlate.identifier,
    slug: availablePlate.slug,
    logoImageHref,
  });

  const savedAssets = await uploadPlateAssets(sb, assets);

  const { error: designUpdateError } = await sb
    .from("plate_designs")
    .update({
      logo_url: logoUrl,
      qr_url: savedAssets.qrPublicUrl,
    })
    .eq("plate_id", availablePlate.id);

  if (designUpdateError) {
    redirect(
      `/admin/vip?error=${encodeURIComponent(
        `Design update failed: ${designUpdateError.message}`
      )}`
    );
  }

  const setupToken = randToken(48);
  const expiresAt = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 14
  ).toISOString();

  const { error: tokenInsertError } = await sb.from("plate_setup_tokens").insert({
    token: setupToken,
    plate_id: availablePlate.id,
    email,
    expires_at: expiresAt,
  });

  if (tokenInsertError) {
    redirect(
      `/admin/vip?error=${encodeURIComponent(
        `Setup token insert failed: ${tokenInsertError.message}`
      )}`
    );
  }

  const shippingLabelSvg = buildShippingLabelSvg({
    name,
    line1: address,
    line2: "",
    city: "",
    state: "",
    postcode: "",
    logoUrl,
  });

  const manufacturingPayload = buildManufacturingEmailPayload({
    to: MANUFACTURING_EMAIL_TO,
    identifier: availablePlate.identifier,
    customerName: name,
    customerEmail: email,
    customerPhone: null,
    shippingName: name,
    shippingLine1: address,
    shippingLine2: null,
    shippingCity: null,
    shippingState: null,
    shippingPostcode: null,
    shippingCountry: null,
    paymentStatus: "vip-allocation",
    amountTotalCents: 0,
    currency: "AUD",
    adminUrl: `${ENV.APP_BASE_URL}/admin/orders?search=${encodeURIComponent(
      availablePlate.identifier
    )}`,
    svgContent: assets.plateSvg,
    qrPngBuffer: assets.qrPngBuffer,
    metadata: {
      ...assets.metadata,
      allocationMode: "vip",
      allocatedName: name,
      allocatedEmail: email,
      allocatedAddress: address,
    },
    svgPublicUrl: savedAssets.svgPublicUrl,
    qrPublicUrl: savedAssets.qrPublicUrl,
    metadataPublicUrl: savedAssets.metadataPublicUrl,
    shippingLabelSvg,
  });

  const manufacturingResult = await sendManufacturingEmail(manufacturingPayload);

  if (!manufacturingResult.ok) {
    redirect("/admin/vip?error=Manufacturing%20email%20failed");
  }

  const customerPayload = buildCustomerPlateEmailPayload(assets, {
    customerEmail: email,
    customerName: name,
    setupToken,
  });

  const customerResult = await sendCustomerPlateEmail(customerPayload);

  if (!customerResult.ok) {
    redirect("/admin/vip?error=Customer%20setup%20email%20failed");
  }

  const vipPayload = buildVipTrialEmailPayload({
    customerEmail: email,
    customerName: name,
    identifier: availablePlate.identifier,
  });

  const vipResult = await sendVipTrialEmail(vipPayload);

  if (!vipResult.ok) {
    redirect("/admin/vip?error=VIP%20trial%20email%20failed");
  }

  redirect(
    `/admin/vip?success=1&identifier=${encodeURIComponent(
      availablePlate.identifier
    )}&email=${encodeURIComponent(email)}`
  );
}

export default async function VipPage({
  searchParams,
}: {
  searchParams?: Promise<{
    success?: string;
    error?: string;
    identifier?: string;
    email?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const sb = supabaseAdmin();

  const identifiers = Array.from({ length: 20 }, (_, i) =>
    formatIdentifier(180 + i)
  );

  const { data: plates } = await sb
    .from("plates")
    .select("id, identifier, slug")
    .in("identifier", identifiers)
    .order("identifier", { ascending: true });

  const plateIds = (plates ?? []).map((p) => p.id);

  const { data: tokens } =
    plateIds.length > 0
      ? await sb
          .from("plate_setup_tokens")
          .select("plate_id, revoked_at")
          .in("plate_id", plateIds)
      : { data: [] as Array<{ plate_id: string; revoked_at: string | null }> };

  const allocatedPlateIds = new Set(
    (tokens ?? []).filter((t) => !t.revoked_at).map((t) => t.plate_id)
  );

  const allocatedPlates = (plates ?? []).filter((p) => allocatedPlateIds.has(p.id));
  const unallocatedPlates = (plates ?? []).filter((p) => !allocatedPlateIds.has(p.id));

  const allocatedSorted = allocatedPlates
    .map((p) => p.identifier)
    .sort((a, b) => (identifierToNumber(a) ?? 0) - (identifierToNumber(b) ?? 0));

  const unallocatedSorted = unallocatedPlates
    .map((p) => p.identifier)
    .sort((a, b) => (identifierToNumber(a) ?? 0) - (identifierToNumber(b) ?? 0));

  const successIdentifier = params.success === "1" ? params.identifier ?? null : null;

  const previousPlate =
    successIdentifier
      ? allocatedSorted
          .filter((identifier) => identifier !== successIdentifier)
          .slice(-1)[0] ?? null
      : allocatedSorted.slice(-1)[0] ?? null;

  const currentPlate =
    successIdentifier ?? unallocatedSorted[0] ?? null;

  const nextPlate =
    successIdentifier
      ? unallocatedSorted[0] ?? null
      : unallocatedSorted[1] ?? null;

  const summaryBoxes = [
    {
      label: "Previous plate sent",
      value: previousPlate ?? "None sent yet",
    },
    {
      label: "Current plate being sent",
      value: currentPlate ?? "None available",
    },
    {
      label: "Next plate",
      value: nextPlate ?? "None remaining",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "32px 16px 56px",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <AdminHeader
          title="VIP Plate Allocation"
          subtitle="Allocate the next available trial plate and send setup as if purchased."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          {summaryBoxes.map((box) => (
            <div
              key={box.label}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 10px 24px rgba(17,24,39,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                {box.label}
              </div>

              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                {box.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 14px 34px rgba(17,24,39,0.08)",
          }}
        >
          {params.error ? (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 10,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontWeight: 700,
              }}
            >
              {params.error}
            </div>
          ) : null}

          {params.success === "1" ? (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 10,
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                fontWeight: 700,
              }}
            >
              VIP plate allocated successfully.
              <div style={{ marginTop: 8, fontWeight: 500 }}>
                Plate: {params.identifier}
              </div>
              <div style={{ marginTop: 4, fontWeight: 500 }}>
                Email: {params.email}
              </div>
            </div>
          ) : null}

          <form action={allocateVipPlate}>
            <label
              style={{
                display: "block",
                marginBottom: 14,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Name
              <input
                name="name"
                type="text"
                required
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: "#fff",
                }}
                placeholder="Customer full name"
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: 14,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Address (shipping)
              <textarea
                name="address"
                required
                rows={4}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  boxSizing: "border-box",
                  resize: "vertical",
                  background: "#fff",
                }}
                placeholder="Enter shipping address"
              />
            </label>

            <label
              style={{
                display: "block",
                marginBottom: 20,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Email
              <input
                name="email"
                type="email"
                required
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  boxSizing: "border-box",
                  background: "#fff",
                }}
                placeholder="customer@example.com"
              />
            </label>

            <button
              type="submit"
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                background: "#111827",
                color: "#fff",
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}