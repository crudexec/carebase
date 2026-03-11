"use client";

import { useQuery } from "@tanstack/react-query";
import { OfferLetterResponse } from "@/types/OfferLetterTypes";
import { fetchUserOfferLetter } from "@/use-cases/admin";
import Loader from "@/components/Loader";
import FormBadge from "@/components/badge/FormBadge";
import { DownloadIcon } from "@radix-ui/react-icons";
import PDFReader from "@/components/pdf/PDFReader";
import PdfPreview from "@/components/pdf/PdfPreview";
import BreadCrumb from "@/components/BreadCrumb";

interface OfferLetterData {
  offer_letter_pdf_url: string;
  full_name: string;
  job_position: string;
}

interface OfferLetterProps {
  data: OfferLetterData | null;
}

const DownloadButton: React.FC<{ offerLetter: OfferLetterData | null }> = ({
  offerLetter,
}) => {
  if (
    !offerLetter?.offer_letter_pdf_url ||
    offerLetter?.offer_letter_pdf_url.length <= 10
  ) {
    return null;
  }

  const generateFileName = () => {
    const name = offerLetter.full_name || "Candidate";
    const position = offerLetter.job_position || "Position";
    return `${name}-${position}-Offer-Letter.pdf`
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_.]/g, "")
      .toLowerCase();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(offerLetter.offer_letter_pdf_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = generateFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("An error occurred while downloading the file. Please try again.");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center gap-2 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-[#285bc9] text-white w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
    >
      Download
      <DownloadIcon className="w-5 h-5 text-white" />
    </button>
  );
};

const OfferLetterReview = ({ name, id }: { name: string; id: string }) => {
  const token = localStorage.getItem("token") as string;
  const { data: offerLetterData, isLoading: offerLetterLoading } = useQuery<
    OfferLetterResponse | boolean
  >({
    queryKey: ["offerLetter"],
    queryFn: async () => await fetchUserOfferLetter(id, token),
  });

  const offerLetter =
    typeof offerLetterData !== "boolean" && typeof offerLetterData === "object"
      ? offerLetterData
      : undefined;

  if (offerLetterLoading) {
    return <Loader height="h-[70vh]" />;
  }

  return (
    <section className="flex flex-col gap-10 py-5">
      <BreadCrumb
        links={[
          { name: "Employees", route: "/admin" },
          {
            name: name,
            route: `/admin?name=${name}&id=${id}`,
          },
          {
            name: "Offer Letter",
            route: `/admin?name=${name}&id=${id}&form=offerLetter&formId=${offerLetter?.data?.id}`,
          },
        ]}
      />

      <h2 className="text-[24px] font-[600] text-[#101828] text-center">
        {name} - Offer Letter
      </h2>

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            Offer Letter
          </h2>
          <FormBadge
            status={
              offerLetter?.data?.signed === true ? "Signed" : "Not Filled"
            }
          >
            {offerLetter?.data?.signed === true ? "Signed" : "Not Filled"}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          {offerLetter?.data?.offer_letter_pdf_url &&
            offerLetter?.data?.offer_letter_pdf_url?.length > 10 && (
              <DownloadButton
                offerLetter={{
                  full_name: offerLetter?.data?.full_name,
                  job_position: offerLetter?.data?.job_position,
                  offer_letter_pdf_url: offerLetter?.data?.offer_letter_pdf_url,
                }}
              />
            )}
        </div>
      </div>

      {offerLetter?.data?.offer_letter_pdf_url &&
      offerLetter?.data?.offer_letter_pdf_url?.length > 10 ? (
        <PdfPreview pdfUrl={offerLetter?.data?.offer_letter_pdf_url ?? ""} />
      ) : (
        <div className="h-full flex items-center justify-center">
          <h2 className="text-[24px] font-[600] text-[#101828] text-center">
            No offer letter was sent to {name}
          </h2>
        </div>
      )}
    </section>
  );
};

{
  /* <a
href={offerLetter?.data?.offer_letter_pdf_url ?? " "}
download={`${offerLetter?.data?.full_name}-${offerLetter?.data?.job_position}-Offer-Letter.pdf`}
className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed bg-[#2563EB] hover:bg-[#285bc9] text-white w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]`}
>
Download
<DownloadIcon className="w-5 h-5 text-white" />
</a> */
}
export default OfferLetterReview;
