import React, { useEffect, useRef } from "react";
import { Form, Viewer } from "@pdfme/ui";
import { Template } from "@pdfme/common";
import { PDFDocument } from "pdf-lib";
import Button from "../button/Button";

const headerHeight = 65;

const PDFReader = ({ pdfUrl }: { pdfUrl: string }) => {
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Viewer | Form | null>(null);

  const loadData = (url: string) => {
    let template: Template = {
      basePdf: url,
      schemas: [{}],
    };
    if (uiRef.current) {
      ui.current = new Form({
        domContainer: uiRef.current,
        template,
        inputs: [{}],
      });
    }
  };

  const loadAndFillPDF = async () => {
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    loadData(url);
  };

  useEffect(() => {
    loadAndFillPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <div
        ref={uiRef}
        style={{ width: "100%", height: `calc(100vh - ${headerHeight}px)` }}
      />{" "}
    </div>
  );
};

export default PDFReader;
