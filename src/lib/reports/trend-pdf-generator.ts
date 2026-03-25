/**
 * Trend Report PDF Generator
 *
 * Generates PDF reports for trend data that can be sent to sponsors
 */

import jsPDF from "jspdf";
import { TrendStats, DataPoint } from "./trend-calculations";

export interface TrendFieldData {
  fieldName: string;
  fieldLabel: string;
  stats: TrendStats;
  dataPoints: DataPoint[];
}

export interface TrendReportPDFParams {
  clientName: string;
  templateName: string;
  companyName: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  fields: TrendFieldData[];
  aggregationMethod?: "latest" | "average" | "first";
}

/**
 * Generate a PDF report for trend data
 */
export async function generateTrendReportPDF(
  params: TrendReportPDFParams
): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Header - Company Name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(params.companyName, margin, y);
  y += 10;

  // Report Title
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo color
  doc.text("Trends Report", margin, y);
  y += 10;

  // Template Name
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // Gray color
  doc.setFont("helvetica", "normal");
  doc.text(`Template: ${params.templateName}`, margin, y);
  y += 8;

  // Date Range
  doc.text(
    `Period: ${formatDate(params.dateRange.start)} - ${formatDate(params.dateRange.end)}`,
    margin,
    y
  );
  y += 8;

  // Client Name
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Client: ${params.clientName}`, margin, y);
  y += 12;

  // Divider line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Summary Section Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", margin, y);
  y += 10;

  // Summary table header
  const colWidths = {
    field: 60,
    avg: 25,
    min: 25,
    max: 25,
    count: 25,
    trend: 30,
  };

  // Table header background
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(75, 85, 99);

  let tableX = margin + 2;
  doc.text("Field", tableX, y);
  tableX += colWidths.field;
  doc.text("Avg", tableX, y);
  tableX += colWidths.avg;
  doc.text("Min", tableX, y);
  tableX += colWidths.min;
  doc.text("Max", tableX, y);
  tableX += colWidths.max;
  doc.text("Count", tableX, y);
  tableX += colWidths.count;
  doc.text("Trend", tableX, y);
  y += 8;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  for (const field of params.fields) {
    // Check if we need a new page
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    tableX = margin + 2;

    // Field name (truncate if too long)
    const fieldLabel =
      field.fieldLabel.length > 30
        ? field.fieldLabel.substring(0, 27) + "..."
        : field.fieldLabel;
    doc.text(fieldLabel, tableX, y);
    tableX += colWidths.field;

    // Stats
    doc.text(field.stats.average.toFixed(1), tableX, y);
    tableX += colWidths.avg;
    doc.text(field.stats.min.toString(), tableX, y);
    tableX += colWidths.min;
    doc.text(field.stats.max.toString(), tableX, y);
    tableX += colWidths.max;
    doc.text(field.stats.count.toString(), tableX, y);
    tableX += colWidths.count;

    // Trend with color
    const trend = field.stats.trend;
    if (trend === "improving") {
      doc.setTextColor(22, 163, 74); // Green
    } else if (trend === "worsening") {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(107, 114, 128); // Gray
    }
    doc.text(capitalizeFirst(trend), tableX, y);
    doc.setTextColor(0, 0, 0);

    y += 7;

    // Light divider between rows
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  }

  y += 15;

  // Detailed Sections for each field
  for (const field of params.fields) {
    // Check if we need a new page
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    // Field section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(field.fieldLabel, margin, y);
    y += 8;

    // Stats row
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99);

    const statsText = `Average: ${field.stats.average.toFixed(1)} | Min: ${field.stats.min} | Max: ${field.stats.max} | Data Points: ${field.stats.count}`;
    doc.text(statsText, margin, y);
    y += 6;

    // Trend indicator
    const trendText = `Trend: ${capitalizeFirst(field.stats.trend)} (slope: ${field.stats.slope.toFixed(3)}/day)`;
    if (field.stats.trend === "improving") {
      doc.setTextColor(22, 163, 74);
    } else if (field.stats.trend === "worsening") {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(107, 114, 128);
    }
    doc.text(trendText, margin, y);
    y += 6;

    // Mini data visualization (simple bar representation)
    if (field.dataPoints.length > 0) {
      doc.setTextColor(75, 85, 99);
      doc.setFontSize(9);
      doc.text("Recent values:", margin, y);
      y += 5;

      // Show last 10 data points as a simple text representation
      const recentPoints = field.dataPoints.slice(-10);
      const maxValue = Math.max(...recentPoints.map((p) => p.value));
      const barWidth = 15;
      const barMaxHeight = 15;

      let barX = margin;
      for (const point of recentPoints) {
        const barHeight = maxValue > 0 ? (point.value / maxValue) * barMaxHeight : 0;

        // Draw bar
        doc.setFillColor(79, 70, 229);
        doc.rect(barX, y + barMaxHeight - barHeight, barWidth - 2, barHeight, "F");

        // Draw value label below
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.text(point.value.toString(), barX + 2, y + barMaxHeight + 8);

        barX += barWidth;
      }
      y += barMaxHeight + 12;
    }

    y += 10;
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );

  doc.text(
    "Report generated by CareBase",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
