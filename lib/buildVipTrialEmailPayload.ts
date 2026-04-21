export type VipTrialEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const LOGO_URL =
  "https://pzlehlwkarefpcoirfhk.supabase.co/storage/v1/object/public/assets/carascan-logo-84x9_2.svg";

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
}) {
  const name = input.customerName?.trim() || "there";
  const safeName = escapeHtml(name);
  const safeIdentifier = escapeHtml(input.identifier);

  const subject = \Welcome to the Carascan trial group (\)\;

  const text = [
    \G'day \,\,
    "",
    \You have been allocated a Carascan trial plate: \.\,
    "",
    "You are part of the first Carascan trial group.",
    "This trial plate has been provided free of charge.",
    "There are no purchase fees and no subscription fees attached to this plate.",
    "",
    "A separate setup email has also been sent to you.",
    "Please use that email to complete your setup and activate your plate.",
    "",
    "Thanks for being part of the first release group.",
    "",
    "Carascan",
  ].join("\n");

  const html = \
    <div style="margin:0;padding:24px 12px;background:#f3f4f6;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="padding:28px 28px 16px 28px;border-bottom:1px solid #e5e7eb;background:#ffffff;text-align:center;">
          <img src="\" alt="Carascan" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;" />
        </div>

        <div style="padding:32px 28px 20px 28px;font-family:Arial,Helvetica,sans-serif;line-height:1.65;color:#1f2937;font-size:16px;">
          <p style="margin:0 0 18px 0;">G'day \,</p>

          <p style="margin:0 0 18px 0;">You have been allocated a Carascan trial plate.</p>

          <p style="margin:0 0 20px 0;"><strong>Plate reference:</strong> \</p>

          <p style="margin:0 0 18px 0;">You are part of the first Carascan trial group.</p>

          <p style="margin:0 0 18px 0;">
            This trial plate has been provided <strong>free of charge</strong>.
            There are <strong>no purchase fees</strong> and
            <strong> no subscription fees</strong> attached to this plate.
          </p>

          <p style="margin:0 0 18px 0;">
            A separate setup email has also been sent to you.
            Please use that email to complete your setup and activate your plate.
          </p>

          <p style="margin:0 0 18px 0;">
            Thanks for being part of the first release group.
          </p>

          <div style="text-align:center;padding-top:8px;">
            <img src="\" alt="Carascan" style="max-width:180px;width:100%;height:auto;" />
          </div>
        </div>
      </div>
    </div>
  \;

  return {
    to: input.customerEmail,
    subject,
    text,
    html,
  };
}
