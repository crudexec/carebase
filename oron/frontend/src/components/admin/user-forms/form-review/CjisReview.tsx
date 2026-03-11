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
import Loader from "@/components/Loader";
import useApproveForm from "@/hooks/admin/useApproveForm";
import { UserFormInfo } from "@/types/AdminTypes";
import useSendReview from "@/hooks/admin/useSendReview";
import FormBanner from "@/components/banner/FormBanner";
import { formatDate } from "@/utils";
import PDFReader from "@/components/pdf/PDFReader";
import PdfPreview from "@/components/pdf/PdfPreview";
import BreadCrumb from "@/components/BreadCrumb";

const CjisReview = ({
  name,
  formInfo,
  id,
}: {
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
}) => {
  const { mutate, isPending, hasApproved, formID } = useApproveForm(
    "cjis",
    name,
    "Cjis Attestation"
  );
  const {
    mutate: mutateReview,
    isPending: reviewPending,
    reviewNote,
    handleChange,
  } = useSendReview("cjis", name, formID!);

  const cjisForm = formInfo?.forms?.cjisAttestation?.data;
  const employeeInformation = cjisForm?.cjisEmployeeInformation;
  const preRegistrationForm = cjisForm?.cjisPreRegistrationForm;

  return (
    <section className="flex flex-col gap-10 py-10">
      <BreadCrumb
        links={[
          { name: "Employees", route: "/admin" },
          {
            name: name,
            route: `/admin?name=${name}&id=${id}`,
          },
          {
            name: "CJIS Attestation",
            route: `/admin?name=${name}&id=${id}&form=cjisAttestation&formId=${formID}`,
          },
        ]}
      />

      <div className="flex justify-between gap-5 flex-wrap">
        <div className="flex flex-wrap gap-5 items-center">
          <h2 className="text-[#101828] text-[30px] font-[600]">
            CJIS Attestation
          </h2>
          <FormBadge
            status={
              reviewPending
                ? "Correction Required"
                : isPending
                ? "Approved"
                : formInfo?.status.cjisAttestation ?? "Not Filled"
            }
          >
            {reviewPending
              ? "Correction Required"
              : isPending
              ? "Approved"
              : formInfo?.status.cjisAttestation}
          </FormBadge>
        </div>
        <div className="flex gap-5 items-center">
          <Dialog>
            <DialogTrigger
              disabled={formInfo?.status.cjisAttestation === "Not Filled"}
            >
              {reviewPending && (
                <button
                  disabled
                  className="bg-[#e159598a] w-[160px] h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500 text-white"
                >
                  <Loader height="h-fit" />
                </button>
              )}

              {!reviewPending && (
                <button
                  disabled={formInfo?.status.cjisAttestation === "Not Filled"}
                  className="flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#c82d2d] disabled:cursor-not-allowed disabled:bg-[#e159598a] disabled:hover:bg-[#e159598a] text-white w-fit h-[40px] px-[16px] py-[8px] rounded-[6px] text-[14px] font-[500]"
                >
                  <Image
                    src="/assets/images/dashboard/reviewIcon.svg"
                    width={20}
                    height={20}
                    alt="info icon"
                  />
                  {formInfo?.status?.cjisAttestation === "Correction Required"
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
              disabled={
                formInfo?.status.cjisAttestation === "Not Filled" ||
                formInfo?.status.cjisAttestation === "Approved" ||
                hasApproved
              }
              onClick={() => mutate(name)}
              className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-[#6287d77e] ${
                formInfo?.status.cjisAttestation === "Not Filled" ||
                formInfo?.status.cjisAttestation === "Approved" ||
                hasApproved
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
              {formInfo?.status.cjisAttestation === "Approved" || hasApproved
                ? "Approved"
                : "Approve"}
            </button>
          )}
        </div>
      </div>

      {formInfo?.status?.cjisAttestation === "Correction Required" && (
        <FormBanner
          variant="warning"
          text={cjisForm?.cjisFullForm?.review_notes ?? ""}
        />
      )}

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px]">
        <h2 className="text-[18px] font-[600] text-[#0F172A]">
          CJIS Attestation
        </h2>

        <div className="w-full  flex justify-between mt-5 flex-col xl:flex-row gap-5">
          <div className="w-full flex h-fit flex-col gap-7">
            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Last Name (Family Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {employeeInformation?.last_name ?? "-"}
              </p>
            </div>

            <div className="w-full flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                Date Of Hire
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {employeeInformation?.date_of_hire
                  ? formatDate(new Date(employeeInformation?.date_of_hire))
                  : "-"}
              </p>
            </div>
          </div>

          <div className="w-full flex h-fit flex-col gap-7">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-[700] text-[#0F172A]">
                First Name (Given Name)
              </h2>
              <p className="text-[14px] font-[400] text-[#0F172A]">
                {employeeInformation?.first_name ?? "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-[1px] border-[#EAECF0] shadow-sm shadow-gray-300 flex-col gap-5 mt-5 h-fit py-10 p-5 rounded-[12px] overflow-auto max-w-[80vw]">
        <div className="w-fit flex gap-5 items-center flex-wrap">
          <h2 className="text-[18px] font-[600] text-[#0F172A]">
            Completion Proof
          </h2>
          {cjisForm?.cjisFullForm?.pre_registration_id !== null &&
            typeof cjisForm?.cjisFullForm?.pre_registration_id === "string" && (
              <a
                download
                href={preRegistrationForm?.pre_registration_pdf_url}
                className="bg-[#d5d5d5] hover:bg-[#d0d2d4] rounded-[6px] px-[20px] py-[10px] text-[#0F172A] text-[14px] font-[500] flex gap-5 items-center md:ml-auto cursor-pointer"
              >
                <Image
                  src="/assets/images/dashboard/downloadIcon.svg"
                  width={15}
                  height={15}
                  alt="download icon"
                />
                Download
              </a>
            )}
        </div>

        {cjisForm?.cjisFullForm?.pre_registration_id !== null &&
          typeof cjisForm?.cjisFullForm?.pre_registration_id === "string" && (
            <PdfPreview
              pdfUrl={preRegistrationForm?.pre_registration_pdf_url}
            />
          )}
      </div>
    </section>
  );
};

export default CjisReview;
