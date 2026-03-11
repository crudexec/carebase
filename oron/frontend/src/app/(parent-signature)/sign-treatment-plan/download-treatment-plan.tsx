"use client";

import { Download } from "lucide-react";
import Image from "next/image";
import { PdfPreviewComp } from "@/components/pdf/PdfPreview";
import { ParentTreatmentPlan } from "@/types/Events";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import { isValidArrayBuffer } from "@/components/clients/TreatmentPreviewModal";
import pdfMake from "pdfmake/build/pdfmake";
import { createTreatmentPlanPDF } from "@/lib/pdf/treatmentPlanPdf";
import { convertDocDefinitionToUint8Array } from "@/utils/treatmentPlanHelpers";
import { format } from "date-fns";

interface Props {
  treatmentPlanData: ParentTreatmentPlan | undefined;
  status: string;
}

const DownloadTreatmentPlan = ({ treatmentPlanData, status }: Props) => {
  const [treatmentPlanPdfDocument, setTreatmentPlanPdfDocument] =
    useState<Uint8Array | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const fileName = treatmentPlanData?.data?.basicInformation
    ? `Treatment_plan_${treatmentPlanData?.data?.basicInformation?.participant_first_name}_${treatmentPlanData?.data?.basicInformation?.participant_last_name}.pdf`
    : "unamed_patient";

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    const docDefinition: any = await createTreatmentPlanPDF(
      {
        ...treatmentPlanData?.data,
        basicInformation: {
          ...treatmentPlanData?.data?.basicInformation,
          implementation_start_date: treatmentPlanData?.data?.basicInformation
            ?.implementation_start_date
            ? format(
                new Date(
                  treatmentPlanData?.data?.basicInformation.implementation_start_date
                ),
                "MM/dd/yyyy"
              )
            : "",
          implementation_stop_date: treatmentPlanData?.data?.basicInformation
            ?.implementation_stop_date
            ? format(
                new Date(
                  treatmentPlanData?.data?.basicInformation?.implementation_stop_date
                ),
                "MM/dd/yyyy"
              )
            : "",
        },
        goals: treatmentPlanData?.data?.treatmentGoal?.toSorted(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
        treatmentGoalSignature: treatmentPlanData?.data?.treatmentGoalSignature,
        schedule:
          treatmentPlanData?.data?.treatmentSchedule &&
          treatmentPlanData?.data?.treatmentSchedule[0] &&
          treatmentPlanData?.data.treatmentSchedule[0].time_slot,
        status: treatmentPlanData?.data?.status,
        parent_name: treatmentPlanData?.data?.parent_name,
        parent_email: treatmentPlanData?.data?.parent_email,
        parent_email_sent: treatmentPlanData?.data?.parent_email_sent,
        relation_to_participant:
          treatmentPlanData?.data?.relation_to_participant,
        id: treatmentPlanData?.data?.id,
      },
      treatmentPlanData?.data?.parent_name ?? "",
      treatmentPlanData?.data?.treatmentGoalSignature?.parent_signature_url ??
        "",
      treatmentPlanData?.data?.treatmentGoalSignature?.date_parent_signed ?? ""
    );
    pdfMake.createPdf(docDefinition).download(fileName);
    setIsGeneratingPdf(false);
  };

  const handleConvertAndSetPdfDocument = async () => {
    if (treatmentPlanData) {
      const docDefinition: any = await createTreatmentPlanPDF(
        {
          ...treatmentPlanData?.data,
          basicInformation: {
            ...treatmentPlanData?.data?.basicInformation,
            implementation_start_date: treatmentPlanData?.data?.basicInformation
              ?.implementation_start_date
              ? format(
                  new Date(
                    treatmentPlanData?.data?.basicInformation.implementation_start_date
                  ),
                  "MM/dd/yyyy"
                )
              : "",
            implementation_stop_date: treatmentPlanData?.data?.basicInformation
              ?.implementation_stop_date
              ? format(
                  new Date(
                    treatmentPlanData?.data?.basicInformation?.implementation_stop_date
                  ),
                  "MM/dd/yyyy"
                )
              : "",
          },
          goals: treatmentPlanData?.data?.treatmentGoal?.toSorted(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          ),
          treatmentGoalSignature:
            treatmentPlanData?.data?.treatmentGoalSignature,
          schedule:
            treatmentPlanData?.data?.treatmentSchedule &&
            treatmentPlanData?.data?.treatmentSchedule[0] &&
            treatmentPlanData?.data.treatmentSchedule[0].time_slot,
          status: treatmentPlanData?.data?.status,
          parent_name: treatmentPlanData?.data?.parent_name,
          parent_email: treatmentPlanData?.data?.parent_email,
          parent_email_sent: treatmentPlanData?.data?.parent_email_sent,
          relation_to_participant:
            treatmentPlanData?.data?.relation_to_participant,
          id: treatmentPlanData?.data?.id,
        },
        treatmentPlanData?.data?.parent_name ?? "",
        treatmentPlanData?.data?.treatmentGoalSignature?.parent_signature_url ??
          "",
        treatmentPlanData?.data?.treatmentGoalSignature?.date_parent_signed ??
          ""
      );
      const uint8Array = await convertDocDefinitionToUint8Array(docDefinition);

      if (isValidArrayBuffer(uint8Array.buffer)) {
        setTreatmentPlanPdfDocument(uint8Array);
      } else {
        console.error("Invalid or detached ArrayBuffer");
      }
    } else {
      console.error("TREATMMENT PLAN NOT FOUND");
    }
  };

  useEffect(() => {
    if (treatmentPlanData) {
      handleConvertAndSetPdfDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatmentPlanData]);

  return (
    <div className="w-full bg-white h-full min-h-screen pb-20">
      <header className="w-full flex gap-2 items-center bg-white h-[10vh] border-[1px] border-[#E4E4E7] py-[16px] px-[32px]">
        <Image
          src={`/assets/images/logo.svg`}
          width={300}
          height={300}
          alt="logo"
          className="w-[136px] h-[48px]"
        />
      </header>

      <div className="flex flex-col justify-start py-10 items-center gap-10 w-full h-full">
        <h1 className="text-[52px] font-[700] text-[#33333B] text-center leading-[60px]">
          Treatment Plan Signed <br /> Successfully
        </h1>

        {treatmentPlanData && (
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="bg-[#2563EB] lg:w-[328px] lg:h-[88px] px-20 py-5 lg:p-0 flex items-center gap-2 text-white text-[32px] font-[400] text-center rounded-[12px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download <Download className="w-10 h-10" />
          </button>
        )}

        <p className="text-[#33333B] text-[24px] font-[400] text-center leading-[30px]">
          You have successfully signed the treatment plan for{" "}
          <span className="font-[700]">
            {treatmentPlanData?.data?.basicInformation
              ?.participant_first_name ?? ""}{" "}
            {treatmentPlanData?.data?.basicInformation?.participant_last_name ??
              ""}
          </span>
          .<br /> You will also receive an email with the signed document.
        </p>

        <div className="w-[770px] h-[385px] px-[17px] py-[32px] rounded-[12px] shadow-md border flex gap-5 items-start">
          {/* PDF Preview */}
          <div className="max-w-[215px] max-h-[304px] overflow-auto h-full w-full shadow-lg relative">
            {treatmentPlanPdfDocument && (
              <PdfPreviewComp
                pdfDocument={treatmentPlanPdfDocument}
                defaultScale={0.3}
              />
            )}
          </div>

          <ul className="flex flex-col gap-1">
            <p className="text-[#47474F] text-[16px] font-[700]">
              Document:{" "}
              <span className="font-[400]">{`Treatment_plan_${treatmentPlanData?.data?.basicInformation?.participant_first_name}_${treatmentPlanData?.data?.basicInformation?.participant_last_name}.pdf`}</span>
            </p>
            <p className="text-[#47474F] text-[16px] font-[700]">
              Status: <span className="font-[400]">{status}</span>
            </p>
            <p className="text-[#47474F] text-[16px] font-[700]">
              Date:{" "}
              <span className="font-[400]">
                {treatmentPlanData?.data?.treatmentGoalSignature
                  ?.date_parent_signed &&
                typeof treatmentPlanData?.data?.treatmentGoalSignature
                  ?.date_parent_signed === "string"
                  ? formatDate(
                      new Date(
                        treatmentPlanData?.data?.treatmentGoalSignature
                          ?.date_parent_signed ?? ""
                      )
                    )
                  : ""}
              </span>
            </p>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DownloadTreatmentPlan;
