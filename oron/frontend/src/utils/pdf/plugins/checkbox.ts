import { ZOOM, Plugin, Schema } from "@pdfme/common";
import { PDFDocument, PDFImage, rgb } from "pdf-lib";

interface Checkbox extends Schema {}

export const checkbox: Plugin<Checkbox> = {
  ui: async (props) => {
    const { schema, value, onChange, rootElement, mode } = props;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.width = `${schema.width * ZOOM}px`;
    checkbox.style.height = `${schema.height * ZOOM}px`;

    checkbox.checked = value === "checked";

    checkbox.addEventListener("change", () => {
      onChange &&
        onChange({ key: "content", value: checkbox.checked ? "checked" : "" });
    });

    if (mode === "viewer") {
      checkbox.disabled = true;
    }

    rootElement.appendChild(checkbox);
  },
  pdf: async (props) => {
    try {
      const { schema, value, page }: any = props;
      const pdfPage = page;
      const pageHeight = pdfPage.getHeight();

      // Convert the UI coordinates to PDF coordinates
      const x = schema.position.x * ZOOM - 60;
      // const y = pageHeight + 86 - (schema.position.y + schema.height) * ZOOM;
      const y = schema.position.y * ZOOM + 160;
      const width = schema.width * ZOOM;
      const height = schema.height * ZOOM;
      if (value === "checked") {
        if (schema.pdfPosition) {
          pdfPage.drawSvg(
            `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" fill="#F0F4FF"/>
            <rect x="0.5" y="0.5" width="15" height="15" rx="3.5" stroke="#3374FF"/>
            <path d="M12 5L6.5 10.5L4 8" stroke="#3374FF" stroke-width="1.6666" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          `,
            {
              x: schema.pdfPosition.x,
              y: schema.pdfPosition.y,
              height: 8,
              width: 8,
            }
          );
        }
      }
    } catch (error) {
      console.error("CHECKBOX ERROR", error);
    }
  },
  propPanel: {
    schema: {},
    defaultSchema: {
      type: "checkbox",
      position: { x: 0, y: 0 },
      width: 20,
      height: 20,
    },
  },
};
