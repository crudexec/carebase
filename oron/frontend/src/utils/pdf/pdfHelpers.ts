import { Template, Font, checkTemplate } from "@pdfme/common";
import { Form, Viewer, Designer } from "@pdfme/ui";
import { generate } from "@pdfme/generator";
import { text, barcodes, image } from "@pdfme/schemas";
import plugins from "./plugins";
import {
  INineFormPageFour,
  INineFormPageOne,
  INineFormPageTwo,
  basePDFI9Form,
} from "./pdf-constant";
import { JobPosition } from "@/components/admin/contants";

const fontObjList = [
  {
    fallback: true,
    label: "NotoSerifJP-Regular",
    url: "/fonts/NotoSerifJP-Regular.otf",
  },
  {
    fallback: false,
    label: "NotoSansJP-Regular",
    url: "/fonts/NotoSansJP-Regular.otf",
  },
];

export const getFontsData = async () => {
  const fontDataList = await Promise.all(
    fontObjList.map(async (font) => ({
      ...font,
      data: await fetch(font.url).then((res) => res.arrayBuffer()),
    }))
  );

  return fontDataList.reduce(
    (acc, font) => ({ ...acc, [font.label]: font }),
    {} as Font
  );
};

export const readFile = (
  file: File | null,
  type: "text" | "dataURL" | "arrayBuffer"
) => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === "text") {
        fileReader.readAsText(file);
      } else if (type === "dataURL") {
        fileReader.readAsDataURL(file);
      } else if (type === "arrayBuffer") {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

export const cloneDeep = (obj: any) => JSON.parse(JSON.stringify(obj));

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, "text").then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    try {
      checkTemplate(template);
      return template;
    } catch (e) {
      throw e;
    }
  });
};

export const downloadJsonFile = (json: any, title: string) => {
  if (typeof window !== "undefined") {
    const blob = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

export const getPlugins = () => {
  return {
    Text: text,
    Signature: plugins.signature,
    CheckBox: plugins.checkbox,
    QR: barcodes.qrcode,
    Image: image,
    SingleInput: plugins.singleValueNumberInput,
  };
};

export const generateFormDataFromPDF = async ({
  template,
  inputs,
  filename,
}: {
  template: Template;
  inputs: {
    [key: string]: string;
  }[];
  filename?: string;
}) => {
  const pdf = await generate({
    template: {
      basePdf: template.basePdf,
      schemas: template.schemas,
      columns: template.columns,
    },
    inputs,
    options: {},
    plugins: getPlugins(),
  });
  const blob = new Blob([pdf.buffer], { type: "application/pdf" });

  const pdfFile = new File([blob], filename || "dynamic_pdf.pdf", {
    type: "application/pdf",
  });

  return pdfFile;
};
export const generatePDF = async (
  currentRef: Designer | Form | Viewer | null
) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === "function"
      ? (currentRef as Viewer | Form).getInputs()
      : template.sampledata ?? [];

  const pdf = await generate({
    template: {
      basePdf: template.basePdf,
      schemas: template.schemas,
      columns: template.columns,
      sampledata: [{}],
    },
    inputs: [],
    options: {},
    plugins: getPlugins(),
  });

  const blob = new Blob([pdf.buffer], { type: "application/pdf" });
  window.open(URL.createObjectURL(blob));

  let reader = new FileReader();
  reader.readAsDataURL(blob);

  reader.onloadend = function () {
    let base64String = reader.result;
  };
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const fetchPdfAsBase64 = async (
  pdfUrl: string
): Promise<string | undefined> => {
  try {
    const response = await fetch(pdfUrl, {
      method: "GET",
      headers: { "Content-Type": "application/pdf" },
    });
    if (!response.ok) {
      throw new Error(`Error fetching PDF: ${response.statusText}`);
    }

    const pdfBlob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(",")[1];
        if (base64data) {
          resolve(base64data);
        } else {
          reject("Failed to convert PDF to base64.");
        }
      };
      reader.onerror = (error) => {
        reject(`Error reading PDF blob: ${error}`);
      };
      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error("Error fetching or converting PDF:", error);
    return undefined;
  }
};
export const getTemplate = (basePDF?: string): Template => ({
  schemas: [INineFormPageOne, {}, INineFormPageTwo, INineFormPageFour],
  basePdf: basePDFI9Form,
  pdfmeVersion: "4.0.0",
});

const insertSignature = (position: { x: number, y: number }) => ({
  signature: {
    type: "signature",
    position,
    width: 36.77,
    height: 10,
    rotate: 0,
    opacity: 1,
    fontSize: 26,
    fontColor: "#14b351",
    fontName: "NotoSerifJP-Regular",
  },
})

export const getOfferLetterTemplate = (basePdf: string, jobPosition: JobPosition): Template => {
  const defaultProps = {
    basePdf,
    pdfmeVersion: "4.0.0",
  }

  if (!jobPosition) return { schemas: [], ...defaultProps };
  

  if (jobPosition === 'DSP (Direct Care Worker)') {
    return {
      ...defaultProps,
      schemas: [
        {},
        insertSignature({ x: 51, y: 175 })
      ]
    }
  }

  if (jobPosition === 'Family Consultant') {
    return {
      ...defaultProps,
      schemas: [
        {},
        insertSignature({ x: 51, y: 75 })
      ]
    }


  }

  if (jobPosition === 'Intensive Individual Support Services(IISS)') {
    return {
      ...defaultProps,
      schemas: [
        {},
        insertSignature({ x: 51, y: 80 })
      ]
    }

  }

  if (jobPosition === 'On-Call Professional') {
    return {
      ...defaultProps,
      schemas: [
        {},
        insertSignature({ x: 51, y: 65 })
      ]
    }
  }

  return { schemas: [], ...defaultProps };

  
}
