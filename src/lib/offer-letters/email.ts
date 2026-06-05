import { emailChannel } from "@/lib/notifications/channels/email";

export async function sendOfferLetterEmail({
  to,
  recipientName,
  companyName,
  subject,
  offerUrl,
  expiresAt,
}: {
  to: string;
  recipientName: string;
  companyName: string;
  subject: string;
  offerUrl: string;
  expiresAt: Date;
}) {
  const body = `
    <p>Dear ${escapeHtml(recipientName)},</p>
    <p>${escapeHtml(companyName)} has sent you an offer letter for review.</p>
    <p>
      <a class="button" href="${offerUrl}">Review Offer Letter</a>
    </p>
    <p>This offer link expires on ${expiresAt.toLocaleDateString("en-US")}.</p>
  `;

  if (!emailChannel.isConfigured()) {
    console.log("=".repeat(60));
    console.log("OFFER LETTER EMAIL (Development Mode - Not Actually Sent)");
    console.log("=".repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Review URL: ${offerUrl}`);
    console.log("=".repeat(60));
    return;
  }

  const result = await emailChannel.send({
    to,
    subject,
    body,
    metadata: {
      tags: [{ name: "type", value: "offer-letter" }],
    },
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to send offer letter email");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
