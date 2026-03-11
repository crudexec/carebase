"use client";
import React, { useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { PDFDocument, StandardFonts } from "pdf-lib";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { handleDocumentUpload } from "@/actions/upload";

const PDFreader = ({ pdfUrl }: { pdfUrl: string }) => {
  const pdfRef: any = useRef(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);

  const token = localStorage.getItem("token") as string;

  useEffect(() => {
    const loadAndFillPDF = async () => {
      const existingPdfBytes = await fetch(pdfUrl).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (pdfRef.current) {
        pdfRef.current.src = url;
      }

      setPdfDoc(pdfDoc);
    };
    loadAndFillPDF();
  }, [pdfUrl]);

  const handleSubmit = async () => {
    try {
      if (!pdfRef.current || !pdfDoc) {
        throw new Error("PDF iframe reference is not set");
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const formData = new FormData();
      formData.append("document", blob, "filled_document.pdf");

      const fileUrl = await handleDocumentUpload(formData, token);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  return (
    <div>
      <iframe ref={pdfRef} width="700px" height="500px"></iframe>
    </div>
  );
};

export default PDFreader;
