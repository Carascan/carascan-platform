import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildStaticMapUrl(lat: number, lng: number) {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return null;

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "15",
    size: "600x300",
    scale: "1",
    maptype: "roadmap",
    format: "png",
    key,
  });

  params.append("markers", `color:red|${lat},${lng}`);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function buildLocationMapBlock(input: {
  latitude?: number | null;
  longitude?: number | null;
  accuracyM?: number | null;
  title?: string;
}) {
  const lat = input.latitude;
  const lng = input.longitude;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return "";
  }

  const safeLat = Number(lat);
  const safeLng = Number(lng);
  const mapsUrl = buildGoogleMapsUrl(safeLat, safeLng);
  const staticMapUrl = buildStaticMapUrl(safeLat, safeLng);
  const heading = input.title || "Location";

  return `
    <div style="margin:20px 0 0 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
      <div style="font-size:16px;font-weight:700;color:#111827;margin:0 0 12px 0;">
        ${escapeHtml(heading)}
      </div>

      ${
        staticMapUrl
          ? `
        <p style="margin:0 0 14px 0;">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <img
              src="${staticMapUrl}"
              alt="Location map"
              width="600"
              border="0"
              style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #d1d5db;border-radius:10px;"
            />
          </a>
        </p>
      `
          : ""
      }

      <p style="margin:0 0 10px 0;">
        <a
          href="${mapsUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;"
        >
          Open in Google Maps
        </a>
      </p>

      <p style="margin:0;color:#374151;">
        <strong>Coordinates:</strong> ${safeLat}, ${safeLng}
      </p>

      ${
        input.accuracyM != null && Number.isFinite(input.accuracyM)
          ? `<p style="margin:8px 0 0 0;color:#374151;"><strong>Accuracy:</strong> ${input.accuracyM}m</p>`
          : ""
      }

      <p style="margin:10px 0 0 0;color:#6b7280;font-size:13px;word-break:break-all;">
        Direct link:<br />
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">
          ${mapsUrl}
        </a>
      </p>
    </div>
  `;
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
) {
  const from = process.env.FROM_EMAIL;

  if (!process.env.RESEND_API_KEY || !from) {
    throw new Error("Missing RESEND_API_KEY or FROM_EMAIL");
  }

  const recipients = Array.isArray(to) ? to : [to];

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result;
}

export async function sendManufacturingEmail(payload: {
  to: string | string[];
  identifier: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracyM?: number | null;
}) {
  const from = process.env.FROM_EMAIL;

  if (!process.env.RESEND_API_KEY || !from) {
    console.warn("Manufacturing email skipped: missing config");
    return { ok: false, skipped: true };
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px 0;">New Plate Ready for Manufacturing</h2>

      <p style="margin:0 0 10px 0;">
        <strong>Identifier:</strong> ${escapeHtml(payload.identifier)}
      </p>

      ${buildLocationMapBlock({
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracyM: payload.accuracyM,
        title: "Manufacturing location reference",
      })}
    </div>
  `;

  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject: `Manufacturing - ${payload.identifier}`,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    ok: true,
    skipped: false,
    result,
  };
}