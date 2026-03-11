import { ZOOM, Plugin, Schema } from "@pdfme/common";
import { BlendMode, PDFDocument, rgb, StandardFonts } from "pdf-lib";

interface SingleValueNumberInput extends Schema {}

export const singleValueNumberInput: Plugin<SingleValueNumberInput> = {
  ui: async (props) => {
    const { schema, value, onChange, rootElement, mode, options } = props;

    const input = document.createElement("input");
    input.type = "text";
    input.style.width = `${schema.width * ZOOM}px`;
    input.style.height = `${schema.height * ZOOM}px`;
    input.style.fontSize = "16px"; // Adjust font size as needed
    input.style.marginTop = "-10px";
    input.maxLength = 1;

    // Ensure only a single digit is shown
    input.value = value && value.length === 1 ? value : "";

    // Add event listener to restrict input to only numbers
    input.addEventListener("input", () => {
      // Filter out non-numeric characters
      input.value = input.value.replace(/[^0-9]/g, "");

      // Ensure the input value remains a single digit
      if (input.value.length > 1) {
        input.value = input.value.slice(0, 1);
      }

      // Trigger the onChange event
      onChange && onChange({ key: "content", value: input.value });
    });

    if (mode === "viewer") {
      input.disabled = true;
    }

    rootElement.appendChild(input);
  },
  pdf: async (props) => {
    try {
      const { schema, value, pdfDoc, page }: any = props;

      // Check if the value is a single digit
      if (!value || value.length !== 1) return;

      const x = schema.position.x * ZOOM;
      const y = schema.position.y * ZOOM;

      // Embed the Helvetica font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Set the font properties
      const fontSize = 8; // Adjust the font size as needed
      // const textWidth = helveticaFont.widthOfTextAtSize(value, fontSize);
      // const textHeight = helveticaFont.heightAtSize(fontSize);

      // Calculate the position to center the text vertically within the input field
      const textY = page.getHeight() - y + 63;

      const textX = x - 50;

      page.drawText(value, {
        x: schema.pdfPosition.x,
        y: textY,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    } catch (error) {}
  },

  propPanel: {
    schema: {},
    defaultSchema: {
      type: "single_number",
      position: { x: 0, y: 0 },
      width: 50, // Adjust width to fit a single digit
      height: 20, // Default height for the input field
    },
  },
};
