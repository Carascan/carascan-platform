export type VipTrialEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

const SITE_URL = "https://carascan.com.au";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildVipTrialEmailPayload(input: {
  customerEmail: string;
  customerName?: string;
  identifier: string;
}): VipTrialEmailPayload {
  const name = input.customerName?.trim() || "there";
  const safeName = escapeHtml(name);

  const subject = `Welcome to Carascan (${input.identifier})`;

  const text = [
    `G'day ${name},`,
    ``,
    `Welcome to Carascan.`,
    ``,
    `Thanks for being part of my journey building this product.`,
    ``,
    `You have been allocated a trial plate: ${input.identifier}.`,
    ``,
    `This plate is provided free of charge, for life.`,
    `No purchase. No subscription. Full premium access.`,
    ``,
    `Please check your separate setup email and complete your setup to activate your plate.`,
    ``,
    `Keep an eye on your letter box because your plate is on its way.`,
    ``,
    `Happy trails.`,
    ``,
    `Nathan Conolan`,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:24px 12px;background:#f3f4f6;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        
        <div style="padding:28px 28px 16px 28px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
            <img
              src="${LOGO_URL}"
              alt="Carascan"
              style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;"
            />
          </a>
        </div>

        <div style="padding:32px 28px 20px 28px;font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#1f2937;font-size:16px;">

          <p style="margin:0 0 18px 0;">G'day ${safeName},</p>

          <p style="margin:0 0 18px 0;">
            Welcome to Carascan.
          </p>

          <p style="margin:0 0 18px 0;">
            Thanks for being part of my journey building this product.
          </p>

          <p style="margin:0 0 18px 0;">
            The idea came from thinking about Mum & Dad travelling — sometimes remote, sometimes in a park.
            Always around people, but you're really not.
            Yet as travellers, we tend to look out for each other.
          </p>

          <p style="margin:0 0 18px 0;">
            After COVID, we're all well versed in QR codes — so this becomes a simple way for people nearby
            to help when it matters.
          </p>

          <p style="margin:0 0 18px 0;">
            In an emergency scenario, a simple scan can alert your nominated contacts instantly —
            providing location and a way to respond quickly.
          </p>

          <p style="margin:0 0 18px 0;">
            More socially, the “Virtual Doorknock” allows travellers to connect without sharing personal details.
            Everything remains private — you choose how and if you respond.
          </p>

          <p style="margin:0 0 18px 0;">
            There's also a “Report Location” feature for those moments where something doesn’t feel right —
            giving others a simple way to check in.
          </p>

          <p style="margin:0 0 18px 0;">
            The goal is simple — enable people to help when needed, while maintaining privacy.
          </p>

          <div style="margin:0 0 22px 0;padding:16px 18px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;">
            <p style="margin:0 0 8px 0;font-weight:700;color:#065f46;">Your VIP Product</p>
            <p style="margin:0;">
              This plate has been provided <strong>free for life</strong> —
              no purchase, no subscription, full premium access (10 emergency contacts).
            </p>
          </div>

          <p style="margin:0 0 18px 0;">
            Please complete your setup using the separate setup email to activate your plate.
          </p>

          <p style="margin:0 0 18px 0;">
            I appreciate your support and feedback — if anything doesn’t work or could be improved,
            I’d genuinely like to hear it.
          </p>

          <p style="margin:0 0 18px 0;">
            Keep an eye on your letter box because your plate is on its way.
          </p>

          <p style="margin:0 0 22px 0;">
            Happy trails.
          </p>

          <p style="margin:0 0 22px 0;font-weight:700;">
            Nathan Conolan
          </p>

          <div style="text-align:center;padding-top:8px;">
            <a href="${SITE_URL}" target="_blank" style="text-decoration:none;">
              <img
                src="${LOGO_URL}"
                alt="Carascan"
                style="display:block;margin:0 auto;max-width:180px;width:100%;height:auto;"
              />
            </a>
          </div>

        </div>
      </div>
    </div>
  `;

  return {
    to: input.customerEmail,
    subject,
    text,
    html,
  };
}