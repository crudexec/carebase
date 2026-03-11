import { useEffect, useState } from "react";

const PdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  const [pdfBase64, setPdfBase64] = useState<string>("");

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        const pdfBlob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(",")[1];
          setPdfBase64(base64data || "");
        };
      } catch (error) {
        console.error("Error fetching PDF:", error);
      }
    };

    fetchPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {pdfBase64 && (
        <embed
          src={`data:application/pdf;base64,${pdfBase64}`}
          type="application/pdf"
          width="100%"
          height="500px"
        />
      )}
    </div>
  );
};

export default PdfViewer;
