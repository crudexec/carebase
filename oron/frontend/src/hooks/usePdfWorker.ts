import { useEffect, useRef, useState } from "react";

export const usePDFWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../public/pdfWorker.js", import.meta.url)
    );
    workerRef.current.onmessage = (e) => {
      const { status, blob, error } = e.data;
      setLoading(false);
      if (status === "success") {
        setPdfBlob(blob);
      } else if (status === "error") {
        console.error("Error generating PDF:", error);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const generatePDF = (data: any) => {
    setLoading(true);
    workerRef.current?.postMessage({ data });
  };

  return { pdfBlob, generatePDF, loading };
};
