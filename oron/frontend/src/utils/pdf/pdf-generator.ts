import jsPDF from "jspdf";

export const pos = [
  {
    x: 10,
    y: 280,
  },
  {
    x: 100,
    y: 280,
  },
  {
    x: 10,
    y: 290,
  },
];

export const generateDynamicPDF = ({
  text,
  employeeName,
  date,
}: {
  text: string;
  employeeName: string;
  date: string;
}) => {
  const pdf = new jsPDF();

  const marginLeft = 10;
  const marginRight = 10;
  const topMargin = 10;
  const bottomMargin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginLeft - marginRight;

  let currentY = topMargin;
  const fontSize = 10;
  const lineHeight = 5;

  pdf.setFontSize(fontSize);

  // Split text to lines
  const splitText = pdf.splitTextToSize(text, usableWidth);

  // Render lines with page breaks
  for (const line of splitText) {
    if (currentY + lineHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      currentY = topMargin;
    }
    pdf.text(line, marginLeft, currentY);
    currentY += lineHeight;
  }

  // Step 2: Draw 2-column field rows for Employee Signature and Full name

  // === First Row ===
  const labelFontSize = 10;
  const fieldLineLength = 50;
  const spacingBetweenColumns = 10;

  // Left column (Employee Signature)
  const leftX = marginLeft;
  const rightX = pageWidth / 2 + spacingBetweenColumns;

  pdf.setFontSize(labelFontSize);
  pdf.text("Employee Signature:", leftX, currentY);
  pdf.line(leftX + 35, currentY, leftX + 35 + fieldLineLength, currentY);

  // Right column (Full Name)
  pdf.text("Full Name:", rightX, currentY);
  pdf.line(rightX + 20, currentY, rightX + 20 + fieldLineLength, currentY);
  pdf.text(employeeName, rightX + 25, currentY - 1);

  currentY += 12; // move to next row

  // === Second Row (Date) ===
  pdf.text("Date:", leftX, currentY);
  pdf.line(leftX + 10, currentY, leftX + 10 + fieldLineLength, currentY);
  pdf.text(date, leftX + 14, currentY - 1);


  const blob = pdf.output("blob");
  return new File([blob], ".pdf", { type: "application/pdf" });
};
