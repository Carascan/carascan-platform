import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type BaseNotifyInput = {
  to: string[];
  identifier: string;
  slug: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  message: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatText(value: string) {
  return value.trim() || "Not provided";
}

function formatHtml(value: string) {
  return escapeHtml(value.trim() || "Not provided");
}

function buildGoogleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildAppleMapsUrl(lat: number, lng: number) {
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${lat},${lng}`;
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
    visual_refresh: "true",
    key,
  });

  params.append("markers", `color:red|${lat},${lng}`);

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

function buildShellHtml(options: {
  title: string;
  accent: string;
  intro: string;
  mapPrimaryLabel: string;
  primaryMapUrl: string;
  secondaryMapUrl?: string;
  secondaryMapLabel?: string;
  staticMapUrl: string | null;
  identifier: string;
  slug: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  message: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
}) {
  const safeIdentifier = escapeHtml(options.identifier);
  const safeSlug = escapeHtml(options.slug);
  const safeReporterName = formatHtml(options.reporterName);
  const safeReporterPhone = formatHtml(options.reporterPhone);
  const safeReporterEmail = formatHtml(options.reporterEmail);
  const safeMessage = options.message.trim()
    ? escapeHtml(options.message).replaceAll("\n", "<br />")
    : "Not provided";

  const accuracy =
    options.accuracyM != null && Number.isFinite(options.accuracyM)
      ? `${options.accuracyM} m`
      : "Not provided";

  const mapImageBlock = options.staticMapUrl
    ? `
      <tr>
        <td style="padding:0 24px 20px 24px;">
          <a href="${options.primaryMapUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
            <img
              src="${options.staticMapUrl}"
              alt="Reported location map"
              width="600"
              border="0"
              style="display:block;width:100%;max-width:600px;height:auto;border:1px solid #d1d5db;border-radius:12px;"
            />
          </a>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="padding:0 24px 20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#4b5563;">
          Map preview unavailable. Use the map links below.
        </td>
      </tr>
    `;

  const secondaryButton =
    options.secondaryMapUrl && options.secondaryMapLabel
      ? `
        <a
          href="${options.secondaryMapUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="display:inline-block;padding:12px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:0 8px 8px 0;"
        >
          ${escapeHtml(options.secondaryMapLabel)}
        </a>
      `
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;margin:0;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 8px 24px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">
                  Carascan
                </div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:${options.accent};">
                  ${escapeHtml(options.title)}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#374151;">
                ${escapeHtml(options.intro)}
              </td>
            </tr>

            ${mapImageBlock}

            <tr>
              <td style="padding:0 24px 16px 24px;font-family:Arial,Helvetica,sans-serif;">
                <a
                  href="${options.primaryMapUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="display:inline-block;padding:12px 16px;background:${options.accent};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:0 8px 8px 0;"
                >
                  ${escapeHtml(options.mapPrimaryLabel)}
                </a>
                ${secondaryButton}
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 24px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;width:160px;">Plate</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeIdentifier}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Public slug</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeSlug}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Reporter</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeReporterName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Phone</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeReporterPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Email</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeReporterEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Coordinates</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${options.lat}, ${options.lng}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;">Accuracy</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${escapeHtml(accuracy)}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;vertical-align:top;">Message</td>
                    <td style="padding:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827;">${safeMessage}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 24px 24px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6b7280;">
                Direct Google Maps link:<br />
                <a href="${options.primaryMapUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;word-break:break-all;">
                  ${options.primaryMapUrl}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

function buildLocationText(input: BaseNotifyInput) {
  const googleMapsUrl = buildGoogleMapsUrl(input.lat, input.lng);

  return [
    "Carascan location report",
    "",
    `Plate: ${input.identifier}`,
    `Public slug: ${input.slug}`,
    `Reporter: ${formatText(input.reporterName)}`,
    `Phone: ${formatText(input.reporterPhone)}`,
    `Email: ${formatText(input.reporterEmail)}`,
    `Coordinates: ${input.lat}, ${input.lng}`,
    input.accuracyM != null ? `Accuracy: ${input.accuracyM} m` : "Accuracy: Not provided",
    `Google Maps: ${googleMapsUrl}`,
    "",
    `Message: ${formatText(input.message)}`,
  ].join("\n");
}

function buildEmergencyText(input: BaseNotifyInput) {
  const googleMapsUrl = buildGoogleMapsUrl(input.lat, input.lng);
  const appleMapsUrl = buildAppleMapsUrl(input.lat, input.lng);

  return [
    "Carascan emergency alert",
    "",
    `Plate: ${input.identifier}`,
    `Public slug: ${input.slug}`,
    `Reporter: ${formatText(input.reporterName)}`,
    `Phone: ${formatText(input.reporterPhone)}`,
    `Email: ${formatText(input.reporterEmail)}`,
    `Coordinates: ${input.lat}, ${input.lng}`,
    input.accuracyM != null ? `Accuracy: ${input.accuracyM} m` : "Accuracy: Not provided",
    `Google Maps: ${googleMapsUrl}`,
    `Apple Maps: ${appleMapsUrl}`,
    "",
    `Message: ${formatText(input.message)}`,
  ].join("\n");
}

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.FROM_EMAIL ||
    "Carascan <noreply@carascan.com.au>";

  const recipients = Array.isArray(to) ? to : [to];

  const result = await resend.emails.send({
    from,
    to: recipients,
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email.");
  }

  return result;
}

export async function sendLocationReportEmail(input: BaseNotifyInput) {
  const html = buildShellHtml({
    title: "Carascan location report",
    accent: "#111827",
    intro: "Someone has reported the location of your plate.",
    mapPrimaryLabel: "Open in Google Maps",
    primaryMapUrl: buildGoogleMapsUrl(input.lat, input.lng),
    staticMapUrl: buildStaticMapUrl(input.lat, input.lng),
    identifier: input.identifier,
    slug: input.slug,
    reporterName: input.reporterName,
    reporterPhone: input.reporterPhone,
    reporterEmail: input.reporterEmail,
    message: input.message,
    lat: input.lat,
    lng: input.lng,
    accuracyM: input.accuracyM,
  });

  const text = buildLocationText(input);

  const result = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      "Carascan <noreply@carascan.com.au>",
    to: input.to,
    subject: `Location report for ${input.identifier}`,
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send location report email.");
  }

  return result;
}

export async function sendEmergencyAlertEmail(input: BaseNotifyInput) {
  const html = buildShellHtml({
    title: "Carascan emergency alert",
    accent: "#b91c1c",
    intro: "Someone has triggered an emergency alert from your plate.",
    mapPrimaryLabel: "Open in Google Maps",
    primaryMapUrl: buildGoogleMapsUrl(input.lat, input.lng),
    secondaryMapUrl: buildAppleMapsUrl(input.lat, input.lng),
    secondaryMapLabel: "Open in Apple Maps",
    staticMapUrl: buildStaticMapUrl(input.lat, input.lng),
    identifier: input.identifier,
    slug: input.slug,
    reporterName: input.reporterName,
    reporterPhone: input.reporterPhone,
    reporterEmail: input.reporterEmail,
    message: input.message,
    lat: input.lat,
    lng: input.lng,
    accuracyM: input.accuracyM,
  });

  const text = buildEmergencyText(input);

  const result = await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      "Carascan <noreply@carascan.com.au>",
    to: input.to,
    subject: `EMERGENCY ALERT for ${input.identifier}`,
    html,
    text,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send emergency alert email.");
  }

  return result;
}