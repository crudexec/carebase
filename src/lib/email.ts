/**
 * Email utility for sending transactional emails
 *
 * This module provides a simple interface for sending emails using
 * environment-configured SMTP settings or email service providers.
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Send an email using the configured email service
 *
 * For production, configure SMTP_* environment variables or
 * use a service like SendGrid, AWS SES, or Resend.
 *
 * @param options - Email options including recipient, subject, and content
 * @returns Promise that resolves when email is sent (or logged in development)
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, text } = options;

  // In development, log the email instead of sending
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    console.log("=".repeat(60));
    console.log("EMAIL (Development Mode - Not Actually Sent)");
    console.log("=".repeat(60));
    console.log(`To: ${Array.isArray(to) ? to.join(", ") : to}`);
    console.log(`Subject: ${subject}`);
    console.log("-".repeat(60));
    console.log("HTML Content:");
    console.log(html);
    if (text) {
      console.log("-".repeat(60));
      console.log("Plain Text Content:");
      console.log(text);
    }
    console.log("=".repeat(60));
    return;
  }

  // Production email sending using nodemailer or similar
  // TODO: Implement actual email sending when SMTP is configured
  // For now, throw an error if SMTP is supposedly configured but implementation is missing
  throw new Error(
    "Email sending not fully implemented. Please configure a proper email service like SendGrid, AWS SES, or Resend."
  );
}
