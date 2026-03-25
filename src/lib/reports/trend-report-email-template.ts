/**
 * Trend Report Email Template
 *
 * Generates HTML email content for trend reports sent to sponsors
 */

export interface TrendSummaryItem {
  fieldLabel: string;
  average: number;
  trend: "improving" | "worsening" | "stable";
  trendPercentage?: number;
}

export interface TrendReportEmailParams {
  sponsorName: string;
  clientName: string;
  templateName: string;
  companyName: string;
  dateRange: string;
  summaryStats: TrendSummaryItem[];
}

/**
 * Generate HTML content for trend report email
 */
export function generateTrendReportEmailHtml(
  params: TrendReportEmailParams
): string {
  const getTrendIcon = (trend: "improving" | "worsening" | "stable") => {
    switch (trend) {
      case "improving":
        return "&#8599;"; // Up-right arrow
      case "worsening":
        return "&#8600;"; // Down-right arrow
      default:
        return "&#8594;"; // Right arrow
    }
  };

  const getTrendColor = (trend: "improving" | "worsening" | "stable") => {
    switch (trend) {
      case "improving":
        return "#16a34a"; // Green
      case "worsening":
        return "#dc2626"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  const statsRows = params.summaryStats
    .map(
      (stat) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            ${stat.fieldLabel}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ${stat.average.toFixed(1)}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: ${getTrendColor(stat.trend)}; font-weight: 500;">
            ${getTrendIcon(stat.trend)} ${capitalizeFirst(stat.trend)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <p>Dear ${params.sponsorName},</p>

    <p>Please find attached the trends report for <strong>${params.clientName}</strong> from ${params.companyName}.</p>

    <div class="alert-box alert-info">
      <table class="info-table">
        <tr>
          <td>Report:</td>
          <td><strong>${params.templateName}</strong></td>
        </tr>
        <tr>
          <td>Client:</td>
          <td><strong>${params.clientName}</strong></td>
        </tr>
        <tr>
          <td>Period:</td>
          <td>${params.dateRange}</td>
        </tr>
      </table>
    </div>

    <h3 style="margin-top: 24px; margin-bottom: 12px; font-size: 16px; color: #374151;">Summary</h3>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 12px 0; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
            Metric
          </th>
          <th style="padding: 12px 0; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
            Average
          </th>
          <th style="padding: 12px 0; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">
            Trend
          </th>
        </tr>
      </thead>
      <tbody>
        ${statsRows}
      </tbody>
    </table>

    <p style="color: #6b7280; font-size: 14px;">
      The detailed report is attached to this email as a PDF. It includes comprehensive statistics
      and visualizations for each tracked metric.
    </p>

    <p style="margin-top: 24px;">If you have any questions about this report, please don't hesitate to contact us.</p>

    <p>Best regards,<br/><strong>${params.companyName}</strong></p>
  `;
}

/**
 * Wrap email content in styled HTML template
 */
export function wrapInTrendReportEmailTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trends Report</title>
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
    .header p {
      margin: 8px 0 0;
      font-size: 14px;
      opacity: 0.9;
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
    .alert-box {
      padding: 16px;
      border-radius: 6px;
      margin: 16px 0;
    }
    .alert-info {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .info-table td:first-child {
      font-weight: 500;
      color: #6b7280;
      width: 100px;
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
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Trends Report</h1>
        <p>Client Progress Summary</p>
      </div>
      <div class="content">
        ${body}
      </div>
      <div class="footer">
        <p>This is an automated report from CareBase.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://app.carebasehealth.com"}">
            Visit CareBase
          </a>
        </p>
        <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
          If you have questions about this report, please contact your care provider.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
