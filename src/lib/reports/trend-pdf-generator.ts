/**
 * Trend Report PDF Generator
 *
 * Generates PDF reports for trend data that can be sent to sponsors
 * Includes visual line charts similar to the app
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

// Chart colors matching the app
const CHART_COLORS = [
  { r: 59, g: 130, b: 246 },   // blue
  { r: 16, g: 185, b: 129 },   // green
  { r: 245, g: 158, b: 11 },   // amber
  { r: 139, g: 92, b: 246 },   // violet
  { r: 239, g: 68, b: 68 },    // red
  { r: 6, g: 182, b: 212 },    // cyan
  { r: 249, g: 115, b: 22 },   // orange
  { r: 236, g: 72, b: 153 },   // pink
];

interface ChartConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

/**
 * Draw a line chart for a field's data
 */
function drawLineChart(
  doc: jsPDF,
  field: TrendFieldData,
  config: ChartConfig,
  color: { r: number; g: number; b: number }
) {
  const { x, y, width, height, padding } = config;
  const chartX = x + padding.left;
  const chartY = y + padding.top;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const dataPoints = field.dataPoints;
  if (dataPoints.length === 0) return;

  // Calculate value range
  let minValue = field.stats.min;
  let maxValue = field.stats.max;
  const valuePadding = (maxValue - minValue) * 0.1 || 1;
  minValue = Math.floor(minValue - valuePadding);
  maxValue = Math.ceil(maxValue + valuePadding);
  const valueRange = maxValue - minValue || 1;

  // Draw chart background
  doc.setFillColor(250, 250, 250);
  doc.rect(chartX, chartY, chartWidth, chartHeight, "F");

  // Draw grid lines (horizontal)
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const lineY = chartY + (chartHeight / gridLines) * i;
    doc.setLineDashPattern([2, 2], 0);
    doc.line(chartX, lineY, chartX + chartWidth, lineY);

    // Y-axis labels
    const value = maxValue - (valueRange / gridLines) * i;
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(value.toFixed(1), chartX - 3, lineY + 1, { align: "right" });
  }
  doc.setLineDashPattern([], 0);

  // Draw X-axis labels (show first, middle, and last dates)
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);

  if (dataPoints.length >= 1) {
    doc.text(formatDate(dataPoints[0].date), chartX, chartY + chartHeight + 8);
  }
  if (dataPoints.length >= 3) {
    const midIndex = Math.floor(dataPoints.length / 2);
    const midX = chartX + (chartWidth / (dataPoints.length - 1)) * midIndex;
    doc.text(formatDate(dataPoints[midIndex].date), midX, chartY + chartHeight + 8, { align: "center" });
  }
  if (dataPoints.length >= 2) {
    doc.text(formatDate(dataPoints[dataPoints.length - 1].date), chartX + chartWidth, chartY + chartHeight + 8, { align: "right" });
  }

  // Draw average reference line
  const avgY = chartY + chartHeight - ((field.stats.average - minValue) / valueRange) * chartHeight;
  doc.setDrawColor(107, 114, 128);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(chartX, avgY, chartX + chartWidth, avgY);
  doc.setLineDashPattern([], 0);

  // Average label
  doc.setFontSize(6);
  doc.setTextColor(107, 114, 128);
  doc.text(`Avg: ${field.stats.average.toFixed(1)}`, chartX + chartWidth + 2, avgY + 1);

  // Calculate point positions
  const points: { x: number; y: number; value: number }[] = dataPoints.map((point, index) => {
    const px = chartX + (chartWidth / Math.max(dataPoints.length - 1, 1)) * index;
    const py = chartY + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { x: px, y: py, value: point.value };
  });

  // Draw the line connecting points
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(1.5);
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }

  // Draw points
  doc.setFillColor(color.r, color.g, color.b);
  for (const point of points) {
    doc.circle(point.x, point.y, 2, "F");
  }

  // Draw white center for hollow effect
  doc.setFillColor(255, 255, 255);
  for (const point of points) {
    doc.circle(point.x, point.y, 1, "F");
  }

  // Refill with color
  doc.setFillColor(color.r, color.g, color.b);
  for (const point of points) {
    doc.circle(point.x, point.y, 1.2, "F");
  }

  // Draw chart border
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.rect(chartX, chartY, chartWidth, chartHeight, "S");
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
  doc.setTextColor(0, 0, 0);
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
    const trendSymbol = trend === "improving" ? "↗" : trend === "worsening" ? "↘" : "→";
    doc.text(`${trendSymbol} ${capitalizeFirst(trend)}`, tableX, y);
    doc.setTextColor(0, 0, 0);

    y += 7;

    // Light divider between rows
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
  }

  y += 15;

  // Charts Section
  const chartHeight = 70;
  const chartWidth = pageWidth - 2 * margin;

  for (let i = 0; i < params.fields.length; i++) {
    const field = params.fields[i];
    const color = CHART_COLORS[i % CHART_COLORS.length];

    // Check if we need a new page
    if (y > pageHeight - chartHeight - 50) {
      doc.addPage();
      y = 20;
    }

    // Field section header with colored indicator
    doc.setFillColor(color.r, color.g, color.b);
    doc.circle(margin + 3, y - 2, 3, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(field.fieldLabel, margin + 10, y);

    // Trend indicator
    const trend = field.stats.trend;
    let trendColor: { r: number; g: number; b: number };
    if (trend === "improving") {
      trendColor = { r: 22, g: 163, b: 74 };
    } else if (trend === "worsening") {
      trendColor = { r: 220, g: 38, b: 38 };
    } else {
      trendColor = { r: 107, g: 114, b: 128 };
    }

    doc.setFontSize(10);
    doc.setTextColor(trendColor.r, trendColor.g, trendColor.b);
    const trendSymbol = trend === "improving" ? "↗" : trend === "worsening" ? "↘" : "→";
    doc.text(`${trendSymbol} ${capitalizeFirst(trend)}`, pageWidth - margin, y, { align: "right" });

    y += 8;

    // Draw the line chart
    if (field.dataPoints.length > 0) {
      drawLineChart(doc, field, {
        x: margin,
        y: y,
        width: chartWidth,
        height: chartHeight,
        padding: { top: 10, right: 35, bottom: 15, left: 25 },
      }, color);

      y += chartHeight + 5;
    } else {
      // No data message
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("No data available for this field", margin, y + 10);
      y += 25;
    }

    // Stats row below chart
    doc.setFontSize(9);
    doc.setTextColor(75, 85, 99);
    doc.setFont("helvetica", "normal");

    const statsText = `Average: ${field.stats.average.toFixed(1)}  |  Min: ${field.stats.min}  |  Max: ${field.stats.max}  |  Data Points: ${field.stats.count}`;
    doc.text(statsText, margin, y);

    y += 15;

    // Divider between fields
    if (i < params.fields.length - 1) {
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
    }
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    const footerY = pageHeight - 10;

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
      margin,
      footerY
    );

    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    doc.text(
      "CareBase",
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
