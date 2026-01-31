/**
 * Email Channel Provider
 *
 * Sends notifications via email using Resend
 */

import { Resend } from "resend";
import { NotificationChannel } from "@prisma/client";
import {
  NotificationChannelProvider,
  ChannelSendOptions,
  ChannelSendResult,
} from "../types";

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "notifications@carebasehealth.com";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "CareBase";

export class EmailChannelProvider implements NotificationChannelProvider {
  name: NotificationChannel = "EMAIL";

  isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
  }

  async send(options: ChannelSendOptions): Promise<ChannelSendResult> {
    if (!resend) {
      return {
        success: false,
        error: "Email service not configured. Set RESEND_API_KEY environment variable.",
      };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject || "Notification from CareBase",
        html: this.wrapInTemplate(options.body),
        tags: options.metadata?.tags as { name: string; value: string }[] | undefined,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
          metadata: { error },
        };
      }

      return {
        success: true,
        messageId: data?.id,
        metadata: { data },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error sending email";
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Wraps the email body in a styled HTML template
   */
  private wrapInTemplate(body: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CareBase Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .content p {
      margin: 0 0 16px;
    }
    .content a {
      color: #4f46e5;
      text-decoration: none;
    }
    .content a:hover {
      text-decoration: underline;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #4338ca;
      text-decoration: none;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }
    .alert-box {
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .alert-critical {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .alert-warning {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .alert-info {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }
    .alert-success {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    .info-table td {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: 500;
      color: #6b7280;
      width: 140px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>CareBase</h1>
      </div>
      <div class="content">
        ${body}
      </div>
      <div class="footer">
        <p>This is an automated notification from CareBase.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com"}">
            Visit CareBase
          </a>
        </p>
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
          If you have questions, please contact your administrator.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

// Export singleton instance
export const emailChannel = new EmailChannelProvider();
