"use client";

import FormBadge from "@/components/badge/FormBadge";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import FormBanner from "@/components/banner/FormBanner";
import useApproveDocument from "@/hooks/admin/useApproveDocument";
import useSendDocumentReview from "@/hooks/admin/useSendDocumentReview";
import Loader from "@/components/Loader";
import { UserDocument } from "@/types/AdminTypes";
import { formatDocumentStatus } from "@/lib/forms/helpers";
import { truncateText } from "@/utils/helpers";
import PdfPreview from "@/components/pdf/PdfPreview";
import BreadCrumb from "@/components/BreadCrumb";

interface Props {
  documentName: string;
  name: string;
  documentId: string;
  userId: string;
  document: UserDocument | undefined;
}

const DocumentReview = ({
  documentName,
  name,
  documentId,
  userId,
  document,
}: Props) => {
  const { mutate, isPending, hasApproved } = useApproveDocument(
    documentId,
    name,
    documentName,
    userId
  );
  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendDocumentReview(name, documentId, userId);

  const documentUrl = document?.document_url ?? "";

  const status =
    document?.status === "not_started" && document?.document_url.length > 1
      ? "Awaiting Approval"
      : formatDocumentStatus(document?.status ?? "");

  return (
    <section className="flex flex-col gap-10 py-10">
      <BreadCrumb
        links={[
          { name: "Employees", route: "/admin" },
          { name: name, route: `/admin?name=${name}&id=${userId}` },
          {
            name: documentName,
            route: `/admin?name=${name}&id=${userId}&documentId=${documentId}&documentName=${documentName}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            {truncateText(documentName, 30)}
          </h2>
          <FormBadge status={status}>{status}</FormBadge>
        </div>
        <div className="flex flex-wrap lg:flex-nowrap gap-5 items-center">
          <a
            download
            href={documentUrl}
            className="bg-[#f4f6f7] hover:bg-[#d0d2d4] rounded-[6px] px-[20px] py-[10px] text-[#0F172A] text-[14px] font-[500] flex gap-5 items-center md:ml-auto cursor-pointer"
          >
            <Image
              src="/assets/images/dashboard/downloadIcon.svg"
              width={15}
              height={15}
              alt="download icon"
            />
            Download
          </a>
          <Dialog>
            <DialogTrigger>
              {reviewPending && (
                <button
                  disabled
                  className="bg-[#e159598a] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white"
                >
                  <Loader height="h-fit" />
                </button>
              )}

              {!reviewPending && (
                <button className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]">
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {status === "Correction Required"
                    ? "Send Another Review"
                    : "Correction Required"}
                </button>
              )}
            </DialogTrigger>

            <DialogContent
              style={{
                boxShadow: "0 0 2000px rgba(0, 0, 0, 0.5)",
              }}
              className="bg-white rounded-[12px] flex flex-col gap-5 shadow-2xl shadow-black/50"
            >
              <div className="w-full flex gap-5 justify-center items-center ml-auto">
                <h2 className="text-[18px] w-full font-[600] text-[#101828] text-center">
                  Correction Required
                </h2>
              </div>

              <p className="text-[14px] font-[400] text-[#475467] text-center">
                The feeback would be sent to the employee
              </p>

              <div className="flex flex-col gap-5 mt-3">
                <Textarea
                  value={reviewNote}
                  onChange={(e) => handleChange(e.target.value)}
                  id="review"
                  placeholder="Enter form review"
                />
              </div>

              <DialogFooter className="flex items-center gap-5 lg:flex-nowrap flex-wrap mt-5">
                <DialogClose className="w-full bg-[#F1F5F9] rounded-[6px] px-5 py-3 h-fit text-black disabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center">
                  Cancel
                </DialogClose>

                <DialogClose
                  onClick={() => {
                    mutateReview(name);
                  }}
                  className="w-full h-fit bg-[#2563EB] hover:bg-[#2b5dca] rounded-[6px] px-5 py-3 text-white ddisabled:bg-[#2564eb69] disabled:cursor-not-allowed flex items-center gap-3 justify-center"
                >
                  Send Review
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isPending && (
            <button className="bg-[#6287d77e] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white">
              <Loader height="h-fit" />
            </button>
          )}

          {!isPending && (
            <button
              disabled={status === "Approved" || hasApproved}
              onClick={() => mutate(name)}
              className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                status === "Approved" || hasApproved
                  ? "bg-[#039855]"
                  : "bg-[#2563EB] hover:bg-[#285bc9]"
              } text-white w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]`}
            >
              <Image
                src="/assets/images/dashboard/approveIcon.svg"
                width={20}
                height={20}
                alt="approve icon"
              />
              {status === "Approved" || hasApproved ? "Approved" : "Approve"}
            </button>
          )}
        </div>
      </div>

      {document?.status == "reviewed" &&
        document?.review_notes &&
        document?.review_notes.length > 0 && (
          <FormBanner variant="warning" text={document?.review_notes ?? ""} />
        )}

      {documentUrl && documentUrl.length > 10 && (
        <div className="max-w-[80vw] lg:w-full">
          <PdfPreview pdfUrl={documentUrl} />
        </div>
      )}
    </section>
  );
};

export default DocumentReview;
