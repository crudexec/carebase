import { pdf } from "@react-pdf/renderer";
import VisitPdf from "../src/components/clients/client-details/client-tabs/assessment-tab/VisitPdf";

self.onmessage = async (e) => {
  const { data } = e.data;

  try {
    const pdfBlob = await pdf(<VisitPdf {...data} />).toBlob();
    self.postMessage({ status: "success", blob: pdfBlob });
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
};
