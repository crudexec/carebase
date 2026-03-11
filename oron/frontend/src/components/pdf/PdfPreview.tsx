"use client";

import { Worker, Viewer, ScrollMode } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  pdfUrl: string;
}
const PDFJS_VERSION = "3.11.174";

const PdfPreview = ({ pdfUrl }: Props) => {
  const [pdfDocument, setPdfDocument] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        setPdfDocument(new Uint8Array(arrayBuffer));
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    fetchPdf();
  }, [pdfUrl]);

  if (!pdfDocument) {
    return (
      <div className="absolute min-h-[50%] flex items-center justify-center w-full">
        <div className="flex items-center justify-center gap-3 text-white text-[15px] font-[500] bg-gray-500 rounded-[8px] w-fit px-[20px] py-[20px] h-fit m-auto cursor-progress">
          <Loader2 className="w-5 h-5 text-white animate-spin" /> Loading
          Document
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "70vh", width: "100%" }}>
      <Worker
        workerUrl={`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`}
      >
        <Viewer fileUrl={pdfDocument} defaultScale={2} />
      </Worker>
    </div>
  );
};

interface PDFProp {
  pdfDocument: Uint8Array | null;
  defaultScale?: number;
}

export const PdfPreviewComp = ({ pdfDocument, defaultScale }: PDFProp) => {
  useEffect(() => {}, [pdfDocument]);
  if (!pdfDocument) {
    return (
      <div className="absolute min-h-[50%] flex items-center justify-center w-full">
        <div className="flex items-center justify-center gap-3 text-white text-[15px] font-[500] bg-gray-500 rounded-[8px] w-fit p-3 h-fit m-auto cursor-progress">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", overflow: "hidden" }}
      // className="bg-black"
    >
      <Worker
        workerUrl={`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.js`}
      >
        <Viewer fileUrl={pdfDocument} defaultScale={defaultScale ?? 1} />
      </Worker>
    </div>
  );
};
export default PdfPreview;
