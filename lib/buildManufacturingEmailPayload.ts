export type ManufacturingEmailAttachment = {
  filename: string;
  content: string;
  contentType: string;
};

export type ManufacturingEmailPayload = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  attachments: ManufacturingEmailAttachment[];
  identifier: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(amountTotalCents?: number | null, currency?: string | null) {
  if (amountTotalCents == null || !currency) return "Not available";

  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountTotalCents / 100);
  } catch {
    return `${(amountTotalCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function buildAddress(input: {
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostcode?: string | null;
  shippingCountry?: string | null;
}) {
  return [
    input.shippingLine1,
    input.shippingLine2,
    [input.shippingCity, input.shippingState, input.shippingPostcode]
      .filter(Boolean)
      .join(" "),
    input.shippingCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

export function buildManufacturingEmailPayload(input: {
  to: string | string[];
  identifier: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingName?: string | null;
  shippingLine1?: string | null;
  shippingLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostcode?: string | null;
  shippingCountry?: string | null;
  paymentStatus?: string | null;
  amountTotalCents?: number | null;
  currency?: string | null;
  adminUrl?: string | null;
  svgContent?: string | null;
  qrPngBuffer?: Buffer | null;
  metadata?: unknown;
  svgPublicUrl?: string | null;
  qrPublicUrl?: string | null;
  metadataPublicUrl?: string | null;
  shippingLabelSvg?: string | null;
}): ManufacturingEmailPayload {
  const customerName = input.customerName?.trim() || "Not provided";
  const customerEmail = input.customerEmail?.trim() || "Not provided";
  const customerPhone = input.customerPhone?.trim() || "Not provided";
  const shippingName = input.shippingName?.trim() || customerName;
  const paymentStatus = input.paymentStatus?.trim() || "unknown";
  const orderValue = formatMoney(input.amountTotalCents, input.currency);
  const shippingAddress = buildAddress(input);
  const safeIdentifier = escapeHtml(input.identifier);
  const safeAdminUrl = input.adminUrl?.trim() || "";
  const safeCustomerName = escapeHtml(customerName);
  const safeCustomerEmail = escapeHtml(customerEmail);
  const safeCustomerPhone = escapeHtml(customerPhone);
  const safeShippingName = escapeHtml(shippingName);
  const safeShippingAddress = escapeHtml(shippingAddress || "Not provided");
  const safePaymentStatus = escapeHtml(paymentStatus);
  const safeOrderValue = escapeHtml(orderValue);

  const attachments: ManufacturingEmailAttachment[] = [];

  if (input.svgContent) {
    attachments.push({
      filename: `${input.identifier}-plate.svg`,
      content: Buffer.from(input.svgContent, "utf8").toString("base64"),
      contentType: "image/svg+xml",
    });
  }

  if (input.qrPngBuffer) {
    attachments.push({
      filename: `${input.identifier}-qr.png`,
      content: input.qrPngBuffer.toString("base64"),
      contentType: "image/png",
    });
  }

  if (input.metadata !== undefined) {
    attachments.push({
      filename: `${input.identifier}-metadata.json`,
      content: Buffer.from(
        JSON.stringify(input.metadata, null, 2),
        "utf8"
      ).toString("base64"),
      contentType: "application/json",
    });
  }

  if (input.shippingLabelSvg) {
    attachments.push({
      filename: `${input.identifier}-shipping-label.svg`,
      content: Buffer.from(input.shippingLabelSvg, "utf8").toString("base64"),
      contentType: "image/svg+xml",
    });
  }

  const text = [
    `Hi team,`,
    ``,
    `A new Carascan plate order is ready for manufacturing.`,
    attachments.length > 0
      ? `The laser-ready files are attached so the SVG can be dragged straight into LightBurn.`
      : `The production reference is ready below.`,
    ``,
    `Identifier: ${input.identifier}`,
    safeAdminUrl ? `Admin job: ${safeAdminUrl}` : null,
    `Payment status: ${paymentStatus}`,
    `Order value: ${orderValue}`,
    ``,
    `Customer details`,
    `Name: ${customerName}`,
    `Email: ${customerEmail}`,
    `Phone: ${customerPhone}`,
    ``,
    `Shipping details`,
    `Recipient: ${shippingName}`,
    `Address: ${shippingAddress || "Not provided"}`,
    ``,
    attachments.length > 0 ? `Attached production pack` : `Linked production files`,
    input.svgContent ? `- ${input.identifier}-plate.svg` : null,
    input.qrPngBuffer ? `- ${input.identifier}-qr.png` : null,
    input.metadata !== undefined ? `- ${input.identifier}-metadata.json` : null,
    input.shippingLabelSvg ? `- ${input.identifier}-shipping-label.svg` : null,
    input.svgPublicUrl ? `SVG public URL: ${input.svgPublicUrl}` : null,
    input.qrPublicUrl ? `QR public URL: ${input.qrPublicUrl}` : null,
    input.metadataPublicUrl ? `Metadata public URL: ${input.metadataPublicUrl}` : null,
    ``,
    `Please process this order proactively.`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111827;">
      <h2 style="margin:0 0 16px 0;">New Carascan Plate Ready for Manufacturing</h2>

      <p style="margin:0 0 14px 0;">Hi team,</p>

      <p style="margin:0 0 14px 0;">
        A new Carascan plate order is ready for manufacturing.
        ${
          attachments.length > 0
            ? ` The laser-ready files are attached so you can drag the SVG straight into LightBurn and proceed without delay.`
            : ` The production details are below so the order can be processed promptly.`
        }
      </p>

      <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;">
        <p style="margin:0 0 10px 0;">
          <strong>Identifier:</strong>
          ${
            safeAdminUrl
              ? `<a href="${safeAdminUrl}" style="color:#2563eb;text-decoration:none;">${safeIdentifier}</a>`
              : safeIdentifier
          }
        </p>
        <p style="margin:0 0 10px 0;"><strong>Payment status:</strong> ${safePaymentStatus}</p>
        <p style="margin:0;"><strong>Order value:</strong> ${safeOrderValue}</p>
      </div>

      <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
        <div style="font-size:15px;font-weight:700;margin:0 0 10px 0;">Customer details</div>
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${safeCustomerName}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${safeCustomerEmail}</p>
        <p style="margin:0;"><strong>Phone:</strong> ${safeCustomerPhone}</p>
      </div>

      <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
        <div style="font-size:15px;font-weight:700;margin:0 0 10px 0;">Shipping details</div>
        <p style="margin:0 0 8px 0;"><strong>Recipient:</strong> ${safeShippingName}</p>
        <p style="margin:0;"><strong>Address:</strong> ${safeShippingAddress}</p>
      </div>

      ${
        attachments.length > 0
          ? `
        <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="font-size:15px;font-weight:700;margin:0 0 10px 0;">Attached production pack</div>
          ${input.svgContent ? `<p style="margin:0 0 8px 0;">• ${escapeHtml(input.identifier)}-plate.svg</p>` : ""}
          ${input.qrPngBuffer ? `<p style="margin:0 0 8px 0;">• ${escapeHtml(input.identifier)}-qr.png</p>` : ""}
          ${input.metadata !== undefined ? `<p style="margin:0 0 8px 0;">• ${escapeHtml(input.identifier)}-metadata.json</p>` : ""}
          ${input.shippingLabelSvg ? `<p style="margin:0;">• ${escapeHtml(input.identifier)}-shipping-label.svg</p>` : ""}
        </div>
      `
          : ""
      }

      ${
        input.svgPublicUrl || input.qrPublicUrl || input.metadataPublicUrl
          ? `
        <div style="margin:18px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="font-size:15px;font-weight:700;margin:0 0 10px 0;">Quick links</div>
          ${
            input.svgPublicUrl
              ? `<p style="margin:0 0 8px 0;"><a href="${input.svgPublicUrl}" style="color:#2563eb;">Open SVG</a></p>`
              : ""
          }
          ${
            input.qrPublicUrl
              ? `<p style="margin:0 0 8px 0;"><a href="${input.qrPublicUrl}" style="color:#2563eb;">Open QR PNG</a></p>`
              : ""
          }
          ${
            input.metadataPublicUrl
              ? `<p style="margin:0;"><a href="${input.metadataPublicUrl}" style="color:#2563eb;">Open metadata JSON</a></p>`
              : ""
          }
        </div>
      `
          : ""
      }

      <p style="margin:18px 0 0 0;">
        Please process this order proactively.
      </p>
    </div>
  `;

  return {
    to: input.to,
    identifier: input.identifier,
    subject: `Manufacturing ready – ${input.identifier}`,
    text,
    html,
    attachments,
  };
}