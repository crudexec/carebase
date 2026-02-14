import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const DEMO_REQUEST_EMAIL = "olumide.southpaw@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "notifications@carebasehealth.com";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "CareBase";

const demoRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = demoRequestSchema.parse(body);

    if (!resend) {
      console.error("Resend not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Demo Request</title>
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
    .field {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    .field:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .value {
      font-size: 16px;
      color: #111827;
    }
    .footer {
      background-color: #f9fafb;
      padding: 16px 24px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>New Demo Request</h1>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Name</div>
          <div class="value">${validatedData.firstName} ${validatedData.lastName}</div>
        </div>
        <div class="field">
          <div class="label">Email</div>
          <div class="value">${validatedData.email}</div>
        </div>
        ${validatedData.phone ? `
        <div class="field">
          <div class="label">Phone</div>
          <div class="value">${validatedData.phone}</div>
        </div>
        ` : ''}
        <div class="field">
          <div class="label">Company</div>
          <div class="value">${validatedData.companyName}</div>
        </div>
        <div class="field">
          <div class="label">Company Size</div>
          <div class="value">${validatedData.companySize}</div>
        </div>
        ${validatedData.message ? `
        <div class="field">
          <div class="label">Message</div>
          <div class="value">${validatedData.message}</div>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        Submitted on ${new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
      to: DEMO_REQUEST_EMAIL,
      replyTo: validatedData.email,
      subject: `Demo Request: ${validatedData.companyName} - ${validatedData.firstName} ${validatedData.lastName}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Demo request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
