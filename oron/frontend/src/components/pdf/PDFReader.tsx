import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@pdfme/ui";
import { Template } from "@pdfme/common";
import { PDFDocument } from "pdf-lib";
import { Loader2 } from "lucide-react";

const headerHeight = 65;

const PDFReader = ({ pdfUrl }: { pdfUrl: string }) => {
  const [documentUrl, setDocumentUrl] = useState(pdfUrl);
  const [isLoading, setIsLoading] = useState(false);
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Viewer | null>(null);

  const loadData = (url: string) => {
    let template: Template = {
      basePdf: url,
      schemas: [{}],
    };
    if (uiRef.current) {
      ui.current = new Viewer({
        domContainer: uiRef.current,
        template,
        inputs: [{}],
      });
    }
  };

  useEffect(() => {
    setDocumentUrl(pdfUrl);
  }, [pdfUrl]);

  const loadAndFillPDF = async () => {
    setIsLoading(true);
    const existingPdfBytes = await fetch(documentUrl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Example: Fill form fields
    // const textField = form.getTextField("Text1");
    // textField.setText("Hello, world!");
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    loadData(url);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAndFillPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentUrl, pdfUrl]);

  if (isLoading) {
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
    <div>
      <div
        ref={uiRef}
        style={{ width: "100%", height: `calc(100vh - ${headerHeight}px)` }}
      />
    </div>
  );
};

export default PDFReader;
